from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.database import get_session
from app.models.pedido_compra import (
    PedidoCompraCreate,
    PedidoCompraRead,
    PedidoCompraEstadoUpdate,
    PedidoCompraCotizacionUpdate,
    PedidoCompraNotificacionUpdate,
)
from app.services.pedido_compra_service import (
    PedidoCompraService,
)


router = APIRouter(
    prefix="/api/v1/pedidos-compra",
    tags=["Pedidos de Compra"]
)

service = PedidoCompraService()


@router.get(
    "",
    response_model=list[PedidoCompraRead]
)
def listar_pedidos(
    session: Session = Depends(get_session)
):
    return service.listar(session)


@router.post(
    "/aprobar-pendientes",
    response_model=list[PedidoCompraRead]
)
def aprobar_todos_pendientes(
    session: Session = Depends(get_session)
):
    return service.aprobar_todos_pendientes(session)


@router.post(
    "/marcar-todas-leidas",
    response_model=list[PedidoCompraRead]
)
def marcar_todas_leidas(
    session: Session = Depends(get_session)
):
    return service.marcar_todas_notificaciones_leidas(session)


@router.get(
    "/{pedido_id}",
    response_model=PedidoCompraRead
)
def obtener_pedido(
    pedido_id: int,
    session: Session = Depends(get_session)
):
    return service.obtener_por_id(session, pedido_id)


@router.post(
    "",
    response_model=PedidoCompraRead,
    status_code=status.HTTP_201_CREATED
)
def crear_pedido(
    datos: PedidoCompraCreate,
    session: Session = Depends(get_session)
):
    return service.crear(session, datos)


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoCompraRead
)
def actualizar_estado(
    pedido_id: int,
    datos: PedidoCompraEstadoUpdate,
    session: Session = Depends(get_session)
):
    return service.actualizar_estado(
        session,
        pedido_id,
        datos
    )


@router.patch(
    "/{pedido_id}/decision-gerencia",
    response_model=PedidoCompraRead
)
def decision_gerencia(
    pedido_id: int,
    datos: PedidoCompraEstadoUpdate,
    session: Session = Depends(get_session)
):
    return service.decision_gerencia(
        session,
        pedido_id,
        datos.estado
    )


@router.patch(
    "/{pedido_id}/notificacion-leida",
    response_model=PedidoCompraRead
)
def marcar_notificacion_leida(
    pedido_id: int,
    datos: PedidoCompraNotificacionUpdate,
    session: Session = Depends(get_session)
):
    return service.marcar_notificacion_leida(
        session,
        pedido_id,
        datos.notificacion_leida
    )


@router.patch(
    "/{pedido_id}/cotizacion",
    response_model=PedidoCompraRead
)
def actualizar_cotizacion(
    pedido_id: int,
    datos: PedidoCompraCotizacionUpdate,
    session: Session = Depends(get_session)
):
    return service.actualizar_cotizacion(
        session,
        pedido_id,
        datos
    )
