"""Controlador para el Tablero de Seguimiento Ejecutivo (Rol Gerencia)."""

from fastapi import APIRouter, Depends

from app.dependencies import get_tablero_service
from app.models.tablero import TableroResumen
from app.services.tablero_service import TableroService


router = APIRouter(
    prefix="/api/v1/tablero",
    tags=["Tablero de Seguimiento"],
)


@router.get(
    "/resumen",
    response_model=TableroResumen,
    summary="Obtener resumen ejecutivo para el Tablero de Gerencia",
)
def obtener_resumen(
    service: TableroService = Depends(get_tablero_service),
):
    """
    Retorna los indicadores de disponibilidad de maquinaria (operativas, alertas,
    mantenimiento, detenidas, OEE promedio) y el listado de incidencias activas en planta.
    """
    return service.obtener_resumen()
