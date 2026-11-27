from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.database import get_session
from app.dependencies import get_tarea_service, requerir_roles
from app.models.tarea import (
    EstadoTarea,
    TareaCreate,
    TareaRead,
    TipoTarea,
)
from app.models.usuario import RolUsuario, Usuario
from app.services.tarea_service import TareaService


router = APIRouter(
    prefix="/api/v1/tareas",
    tags=["Tareas y Reparaciones Planificadas"],
)


# ==========================================
# ESQUEMAS
# ==========================================

class ProgresoUpdate(BaseModel):
    progreso: int = Field(ge=0, le=100)
    observaciones: str | None = None


class TecnicoRead(BaseModel):
    id: int
    username: str
    nombre: str


# ==========================================
# LISTAR TAREAS
# ==========================================

@router.get("", response_model=list[TareaRead])
def listar_tareas(
    tipo: TipoTarea | None = None,
    estado: EstadoTarea | None = None,
    maquina_id: int | None = None,
    service: TareaService = Depends(get_tarea_service),
    usuario: Usuario = Depends(
        requerir_roles(
            RolUsuario.ENCARGADO,
            RolUsuario.GERENCIA,
            RolUsuario.MANTENIMIENTO,
        )
    ),
):
    return service.listar(
        tipo=tipo,
        estado=estado,
        maquina_id=maquina_id,
        tecnico_asignado_id=(
            usuario.id
            if usuario.rol == RolUsuario.MANTENIMIENTO
            else None
        ),
    )


# ==========================================
# MIS TAREAS - MANTENIMIENTO
# ==========================================

@router.get("/mis-tareas", response_model=list[TareaRead])
def listar_mis_tareas(
    estado: EstadoTarea | None = None,
    service: TareaService = Depends(get_tarea_service),
    usuario: Usuario = Depends(
        requerir_roles(RolUsuario.MANTENIMIENTO)
    ),
):
    return service.listar(
        estado=estado,
        tecnico_asignado_id=usuario.id,
    )


# ==========================================
# TÉCNICOS DISPONIBLES
# ==========================================

@router.get("/tecnicos", response_model=list[TecnicoRead])
def listar_tecnicos(
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(
        requerir_roles(RolUsuario.ENCARGADO)
    ),
):
    consulta = (
        select(Usuario)
        .where(
            Usuario.rol == RolUsuario.MANTENIMIENTO,
            Usuario.activo == True,
        )
        .order_by(Usuario.nombre)
    )

    tecnicos = session.exec(consulta).all()

    return [
        TecnicoRead(
            id=tecnico.id,
            username=tecnico.username,
            nombre=tecnico.nombre,
        )
        for tecnico in tecnicos
    ]


# ==========================================
# DETALLE DE TAREA
# ==========================================

@router.get("/{tarea_id}", response_model=TareaRead)
def obtener_tarea(
    tarea_id: int,
    service: TareaService = Depends(get_tarea_service),
    usuario: Usuario = Depends(
        requerir_roles(
            RolUsuario.ENCARGADO,
            RolUsuario.MANTENIMIENTO,
            RolUsuario.GERENCIA,
        )
    ),
):
    try:
        tarea = service.obtener_por_id(tarea_id)

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    if (
        usuario.rol == RolUsuario.MANTENIMIENTO
        and tarea.tecnico_asignado_id != usuario.id
    ):
        raise HTTPException(
            status_code=403,
            detail="No tenés acceso a esta tarea",
        )

    return tarea


# ==========================================
# CREAR Y ASIGNAR TAREA
# ==========================================

@router.post(
    "",
    response_model=TareaRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_tarea(
    datos: TareaCreate,
    service: TareaService = Depends(get_tarea_service),
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(
        requerir_roles(RolUsuario.ENCARGADO)
    ),
):
    from app.models.maquina import Maquina
    from sqlalchemy.exc import IntegrityError

    maquina = session.get(Maquina, datos.maquina_id)

    if not maquina or not maquina.activo:
        raise HTTPException(
            status_code=400,
            detail="La máquina no existe o está inactiva",
        )

    if datos.tecnico_asignado_id is not None:

        tecnico = session.get(
            Usuario,
            datos.tecnico_asignado_id,
        )

        if (
            not tecnico
            or not tecnico.activo
            or tecnico.rol != RolUsuario.MANTENIMIENTO
        ):
            raise HTTPException(
                status_code=400,
                detail="El técnico seleccionado no es válido",
            )

    if service.repository.obtener_por_codigo(datos.codigo):
        raise HTTPException(
            status_code=409,
            detail="Ya existe una tarea con ese código",
        )

    if not 0 <= datos.progreso <= 100:
        raise HTTPException(
            status_code=422,
            detail="El progreso debe estar entre 0 y 100",
        )

    try:
        return service.crear(datos)

    except IntegrityError as error:
        raise HTTPException(
            status_code=409,
            detail="No se pudo crear la tarea por un conflicto de datos",
        ) from error


# ==========================================
# ACTUALIZAR PROGRESO Y OBSERVACIONES
# ==========================================

@router.patch(
    "/{tarea_id}/progreso",
    response_model=TareaRead,
)
def actualizar_progreso(
    tarea_id: int,
    datos: ProgresoUpdate,
    service: TareaService = Depends(get_tarea_service),
    usuario: Usuario = Depends(
        requerir_roles(
            RolUsuario.ENCARGADO,
            RolUsuario.MANTENIMIENTO,
        )
    ),
):
    try:
        tarea = service.obtener_por_id(tarea_id)

        if usuario.rol == RolUsuario.MANTENIMIENTO:

            if tarea.tecnico_asignado_id != usuario.id:
                raise HTTPException(
                    status_code=403,
                    detail="No podés modificar una tarea ajena",
                )

            if datos.progreso < tarea.progreso:
                raise HTTPException(
                    status_code=400,
                    detail="No podés reducir el progreso registrado",
                )

            if tarea.estado == EstadoTarea.COMPLETADA:
                raise HTTPException(
                    status_code=400,
                    detail="La tarea ya está completada",
                )

        return service.actualizar_progreso(
            tarea_id,
            datos.progreso,
            datos.observaciones,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error
