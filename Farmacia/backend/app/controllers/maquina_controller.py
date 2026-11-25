from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_maquina_service
from app.models.maquina import (
    MaquinaAltaBOMRead,
    MaquinaRead,
    MaquinaCreate,
    MaquinaUpdate,
    MaquinaActivoUpdate,
)
from app.services.maquina_service import MaquinaService


router = APIRouter(
    prefix="/api/v1/maquinas",
    tags=["Máquinas"],
)


@router.get("", response_model=list[MaquinaRead])
def listar_maquinas(
    incluir_inactivas: bool = False,
    estado: str | None = None,
    sector: str | None = None,
    service: MaquinaService = Depends(get_maquina_service),
):
    return service.listar(
        incluir_inactivas=incluir_inactivas,
        estado=estado,
        sector=sector,
    )


@router.get("/{maquina_id}", response_model=MaquinaRead)
def obtener_maquina(
    maquina_id: int,
    service: MaquinaService = Depends(get_maquina_service),
):
    try:
        return service.obtener_por_id(maquina_id)
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.post(
    "",
    response_model=MaquinaRead,
    status_code=status.HTTP_201_CREATED
)
def crear_maquina(
    datos: MaquinaCreate,
    service: MaquinaService = Depends(get_maquina_service),
):
    return service.crear(datos)


@router.post(
    "/alta-bom",
    response_model=MaquinaAltaBOMRead,
    status_code=status.HTTP_201_CREATED
)
def crear_maquina_con_bom(
    datos: MaquinaCreate,
    service: MaquinaService = Depends(get_maquina_service),
):
    return service.crear_con_bom(datos)


@router.patch("/{maquina_id}", response_model=MaquinaRead)
def actualizar_maquina(
    maquina_id: int,
    datos: MaquinaUpdate,
    service: MaquinaService = Depends(get_maquina_service),
):
    try:
        return service.actualizar(maquina_id, datos)
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.patch("/{maquina_id}/activo", response_model=MaquinaRead)
def cambiar_activo_maquina(
    maquina_id: int,
    datos: MaquinaActivoUpdate,
    service: MaquinaService = Depends(get_maquina_service),
):
    try:
        return service.cambiar_activo(maquina_id, datos.activo)
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error
