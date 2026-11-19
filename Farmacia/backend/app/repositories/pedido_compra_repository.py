
from sqlmodel import Session, select

from app.models.pedido_compra import PedidoCompra


class PedidoCompraRepository:

    def listar(self, session: Session) -> list[PedidoCompra]:
        statement = (
            select(PedidoCompra)
            .order_by(
                PedidoCompra.fecha.desc(),
                PedidoCompra.id.desc()
            )
        )

        return list(session.exec(statement).all())

    def obtener_por_id(
        self,
        session: Session,
        pedido_id: int
    ) -> PedidoCompra | None:
        return session.get(PedidoCompra, pedido_id)

    def crear(
        self,
        session: Session,
        pedido: PedidoCompra
    ) -> PedidoCompra:
        session.add(pedido)
        session.flush()
        return pedido

    def actualizar(
        self,
        session: Session,
        pedido: PedidoCompra
    ) -> PedidoCompra:
        session.add(pedido)
        session.flush()
        return pedido
