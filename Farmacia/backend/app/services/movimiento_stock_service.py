
from fastapi import HTTPException
from sqlmodel import Session

from app.models.movimiento_stock import (
    MovimientoStock,
    TipoMovimientoStock,
    IngresoStockCreate,
    IngresoStockRead,
    MovimientoStockRead,
)

from app.repositories.movimiento_stock_repository import (
    MovimientoStockRepository,
)


class MovimientoStockService:

    def __init__(self):
        self.repository = MovimientoStockRepository()

    def registrar_ingreso(
        self,
        session: Session,
        repuesto_id: int,
        datos: IngresoStockCreate
    ) -> IngresoStockRead:

        if datos.cantidad <= 0:
            raise HTTPException(
                status_code=422,
                detail="La cantidad debe ser mayor a cero"
            )

        if not all([
            datos.remito.strip(),
            datos.ubicacion.strip(),
            datos.proveedor.strip(),
            datos.tecnico_delegado.strip()
        ]):
            raise HTTPException(
                status_code=422,
                detail="Los campos obligatorios no pueden estar vacíos"
            )

        try:
            # Bloquear y obtener repuesto
            repuesto = (
                self.repository.obtener_repuesto_para_actualizar(
                    session,
                    repuesto_id
                )
            )

            if repuesto is None:
                raise HTTPException(
                    status_code=404,
                    detail="Repuesto no encontrado"
                )

            stock_anterior = repuesto.disponible

            # Actualizar stock y ubicación
            repuesto.disponible += datos.cantidad
            repuesto.ubicacion = datos.ubicacion.strip()

            session.add(repuesto)

            # Registrar movimiento de ingreso
            movimiento = MovimientoStock(
                repuesto_id=repuesto_id,
                tipo=TipoMovimientoStock.INGRESO,
                cantidad=datos.cantidad,
                motivo="Recepción de compra RN-08",
                remito=datos.remito.strip(),
                ubicacion=datos.ubicacion.strip(),
                proveedor=datos.proveedor.strip(),
                tecnico_delegado=datos.tecnico_delegado.strip(),
                observaciones=datos.observaciones.strip()
            )

            self.repository.crear_movimiento(
                session,
                movimiento
            )

            # Una sola transacción para ambas operaciones
            session.commit()

            session.refresh(movimiento)
            session.refresh(repuesto)

            return IngresoStockRead(
                movimiento=MovimientoStockRead.model_validate(
                    movimiento
                ),
                stock_anterior=stock_anterior,
                stock_actual=repuesto.disponible
            )

        except Exception:
            session.rollback()
            raise

    def listar_movimientos(
        self,
        session: Session,
        repuesto_id: int
    ) -> list[MovimientoStockRead]:

        movimientos = self.repository.listar_por_repuesto(
            session,
            repuesto_id
        )

        return [
            MovimientoStockRead.model_validate(movimiento)
            for movimiento in movimientos
        ]
