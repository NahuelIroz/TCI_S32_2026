from sqlmodel import Session, select

from app.models.incidencia import Incidencia
from app.models.maquina import Maquina
from app.models.movimiento_stock import MovimientoStock, TipoMovimientoStock
from app.models.pedido_compra import PedidoCompra
from app.models.repuesto import Repuesto


class EstadisticaRepository:

    def __init__(self, session: Session):
        self.session = session

    def obtener_incidencias(self) -> list[Incidencia]:
        statement = select(Incidencia).order_by(Incidencia.fecha_reporte.desc())
        return list(self.session.exec(statement).all())

    def obtener_maquinas(self) -> list[Maquina]:
        statement = select(Maquina).where(Maquina.activo == True)
        return list(self.session.exec(statement).all())

    def obtener_repuestos(self) -> list[Repuesto]:
        statement = select(Repuesto).where(Repuesto.activo == True)
        return list(self.session.exec(statement).all())

    def obtener_consumos_stock(self) -> list[MovimientoStock]:
        statement = select(MovimientoStock).where(
            MovimientoStock.tipo == TipoMovimientoStock.CONSUMO
        )
        return list(self.session.exec(statement).all())

    def obtener_pedidos_compra(self) -> list[PedidoCompra]:
        statement = select(PedidoCompra)
        return list(self.session.exec(statement).all())
