
"""Endpoints HTTP para Incidencias."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_incidencia_service
from app.models.incidencia import (
    IncidenciaCreate,
    IncidenciaRead,
    IncidenciaEstadoUpdate,
    EstadoIncidencia,
    Turno,
)
from app.services.incidencia_service import IncidenciaService


router = APIRouter(
    prefix="/api/v1/incidencias",
    tags=["Incidencias"],
)


@router.post(
    "",
    response_model=IncidenciaRead,
    status_code=status.HTTP_201_CREATED,
)
def reportar_incidencia(
    datos: IncidenciaCreate,
    service: IncidenciaService = Depends(get_incidencia_service),
):
    try:
        return service.reportar(
            maquina_codigo=datos.maquina_codigo,
            usuario_id=datos.usuario_id,
            descripcion=datos.descripcion,
            turno=datos.turno,
            prioridad=datos.prioridad,
        )

    except PermissionError as error:
        raise HTTPException(
            status_code=403,
            detail=str(error),
        ) from error

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error



@router.get(
    "",
    response_model=list[IncidenciaRead],
)
def listar_incidencias(
    estado: EstadoIncidencia | None = None,
    maquina_id: int | None = None,
    turno: Turno | None = None,
    usuario_id: int | None = None,
    service: IncidenciaService = Depends(get_incidencia_service),
):
    return service.listar(
        estado=estado,
        maquina_id=maquina_id,
        turno=turno,
        usuario_id=usuario_id,
    )



@router.get(
    "/{incidencia_id}",
    response_model=IncidenciaRead,
)
def obtener_incidencia(
    incidencia_id: int,
    service: IncidenciaService = Depends(get_incidencia_service),
):
    try:
        return service.obtener_por_id(incidencia_id)

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    
@router.patch(
    "/{incidencia_id}/estado",
    response_model=IncidenciaRead,
)
def cambiar_estado_incidencia(
    incidencia_id: int,
    datos: IncidenciaEstadoUpdate,
    service: IncidenciaService = Depends(get_incidencia_service),
):
    try:
        return service.cambiar_estado(
            incidencia_id=incidencia_id,
            nuevo_estado=datos.estado,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

