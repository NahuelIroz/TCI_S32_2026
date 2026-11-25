from fastapi import APIRouter, Depends

from app.dependencies import get_estadistica_service
from app.models.estadistica import EstadisticasHistoricosRead
from app.services.estadistica_service import EstadisticaService


router = APIRouter(
    prefix="/api/v1/estadisticas",
    tags=["Estadísticas e Históricos"],
)


@router.get(
    "/historicos",
    response_model=EstadisticasHistoricosRead,
)
def obtener_estadisticas_historicas(
    service: EstadisticaService = Depends(get_estadistica_service),
):
    return service.obtener_historicos()
