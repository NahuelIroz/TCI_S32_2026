from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.dependencies import get_tarea_service
from app.models.tarea import EstadoTarea, TareaCreate, TareaRead, TipoTarea
from app.services.tarea_service import TareaService


router = APIRouter(
    prefix="/api/v1/tareas",
    tags=["Tareas y Reparaciones Planificadas"],
)


class ProgresoUpdate(BaseModel):
    progreso: int = Field(ge=0, le=100)


@router.get("", response_model=list[TareaRead])
def listar_tareas(
    tipo: TipoTarea | None = None,
    estado: EstadoTarea | None = None,
    maquina_id: int | None = None,
    service: TareaService = Depends(get_tarea_service),
):
    return service.listar(tipo=tipo, estado=estado, maquina_id=maquina_id)


@router.get("/{tarea_id}", response_model=TareaRead)
def obtener_tarea(
    tarea_id: int,
    service: TareaService = Depends(get_tarea_service),
):
    try:
        return service.obtener_por_id(tarea_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.post("", response_model=TareaRead, status_code=status.HTTP_201_CREATED)
def crear_tarea(
    datos: TareaCreate,
    service: TareaService = Depends(get_tarea_service),
):
    return service.crear(datos)


@router.patch("/{tarea_id}/progreso", response_model=TareaRead)
def actualizar_progreso(
    tarea_id: int,
    datos: ProgresoUpdate,
    service: TareaService = Depends(get_tarea_service),
):
    try:
        return service.actualizar_progreso(tarea_id, datos.progreso)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
