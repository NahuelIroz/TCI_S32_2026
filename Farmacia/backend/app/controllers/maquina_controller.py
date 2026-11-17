
from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_maquina_service
from app.models.maquina import Maquina
from app.services.maquina_service import MaquinaService


router = APIRouter(
    prefix="/api/v1/maquinas",
    tags=["Máquinas"],
)


@router.get("", response_model=list[Maquina])
def listar_maquinas(
    service: MaquinaService = Depends(get_maquina_service),
):
    return service.listar()


@router.get("/{maquina_id}", response_model=Maquina)
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
