
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.database import get_session

from app.models.movimiento_stock import (
    IngresoStockCreate,
    IngresoStockRead,
    MovimientoStockRead,
    ConsumoStockCreate,
    ConsumoStockRead,
)

from app.services.movimiento_stock_service import (
    MovimientoStockService,
)


router = APIRouter(
    prefix="/api/v1/repuestos",
    tags=["Movimientos de Stock"]
)

service = MovimientoStockService()


@router.post(
    "/{repuesto_id}/ingresos",
    response_model=IngresoStockRead,
    status_code=status.HTTP_201_CREATED
)
def registrar_ingreso(
    repuesto_id: int,
    datos: IngresoStockCreate,
    session: Session = Depends(get_session)
):
    return service.registrar_ingreso(
        session,
        repuesto_id,
        datos
    )


@router.get(
    "/{repuesto_id}/movimientos",
    response_model=list[MovimientoStockRead]
)
def listar_movimientos(
    repuesto_id: int,
    session: Session = Depends(get_session)
):
    return service.listar_movimientos(
        session,
        repuesto_id
    )


@router.post(
    "/{repuesto_id}/consumos",
    response_model=ConsumoStockRead,
    status_code=status.HTTP_201_CREATED
)
def registrar_consumo(
    repuesto_id: int,
    datos: ConsumoStockCreate,
    session: Session = Depends(get_session)
):
    return service.registrar_consumo(
        session,
        repuesto_id,
        datos
    )

