
from sqlmodel import Session, select

from app.models.repuesto import Repuesto
from app.models.movimiento_stock import MovimientoStock


class MovimientoStockRepository:

    def obtener_repuesto_para_actualizar(
        self,
        session: Session,
        repuesto_id: int
    ) -> Repuesto | None:

        consulta = (
            select(Repuesto)
            .where(Repuesto.id == repuesto_id)
            .with_for_update()
        )

        return session.exec(consulta).first()

    def crear_movimiento(
        self,
        session: Session,
        movimiento: MovimientoStock
    ) -> MovimientoStock:

        session.add(movimiento)

        return movimiento

    def listar_por_repuesto(
        self,
        session: Session,
        repuesto_id: int
    ) -> list[MovimientoStock]:

        consulta = (
            select(MovimientoStock)
            .where(MovimientoStock.repuesto_id == repuesto_id)
            .order_by(
                MovimientoStock.fecha.desc(),
                MovimientoStock.id.desc()
            )
        )

        return list(session.exec(consulta).all())
