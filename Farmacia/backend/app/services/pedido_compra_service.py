
from datetime import datetime

from fastapi import HTTPException
from sqlmodel import Session

from app.models.repuesto import Repuesto
from app.models.pedido_compra import (
    PedidoCompra,
    PedidoCompraCreate,
    PedidoCompraRead,
    PedidoCompraEstadoUpdate,
    EstadoPedido,
    PedidoCompraCotizacionUpdate,
)
from app.repositories.pedido_compra_repository import (
    PedidoCompraRepository,
)


class PedidoCompraService:

    def __init__(self):
        self.repository = PedidoCompraRepository()

    def convertir_a_read(
        self,
        session: Session,
        pedido: PedidoCompra
    ) -> PedidoCompraRead:

        repuesto = session.get(Repuesto, pedido.repuesto_id)

        if repuesto is None:
            raise HTTPException(
                status_code=404,
                detail="El repuesto asociado no existe"
            )

        fecha = pedido.fecha
        anio = fecha.year if isinstance(fecha, datetime) else 2026

        return PedidoCompraRead(
            id=pedido.id,
            codigo_pedido=f"PED-{anio}-{pedido.id:05d}",
            repuesto_id=pedido.repuesto_id,
            codigo=repuesto.codigo,
            repuesto_nombre=repuesto.nombre,
            unidad=repuesto.unidad,
            cantidad=pedido.cantidad,
            prioridad=pedido.prioridad,
            justificacion=pedido.justificacion,
            estado=pedido.estado,
            fecha=pedido.fecha,
            solicitante=pedido.solicitante,
            monto_estimado=pedido.monto_estimado,
            proveedor=pedido.proveedor,
            notificacion_leida=pedido.notificacion_leida,
        )

    def listar(
        self,
        session: Session
    ) -> list[PedidoCompraRead]:

        pedidos = self.repository.listar(session)

        return [
            self.convertir_a_read(session, pedido)
            for pedido in pedidos
        ]

    def obtener_por_id(
        self,
        session: Session,
        pedido_id: int
    ) -> PedidoCompraRead:

        pedido = self.repository.obtener_por_id(
            session,
            pedido_id
        )

        if pedido is None:
            raise HTTPException(
                status_code=404,
                detail="Pedido de compra no encontrado"
            )

        return self.convertir_a_read(session, pedido)

    def crear(
        self,
        session: Session,
        datos: PedidoCompraCreate
    ) -> PedidoCompraRead:

        repuesto = session.get(Repuesto, datos.repuesto_id)

        if repuesto is None:
            raise HTTPException(
                status_code=404,
                detail="El repuesto solicitado no existe"
            )

        pedido = PedidoCompra(
            repuesto_id=datos.repuesto_id,
            cantidad=datos.cantidad,
            prioridad=datos.prioridad,
            justificacion=datos.justificacion.strip(),
            estado=EstadoPedido.PENDIENTE,
            solicitante=datos.solicitante.strip(),
            monto_estimado=datos.monto_estimado,
            proveedor=datos.proveedor.strip(),
            notificacion_leida=False,
        )

        try:
            self.repository.crear(session, pedido)

            session.commit()
            session.refresh(pedido)

        except Exception:
            session.rollback()
            raise

        return self.convertir_a_read(session, pedido)

    def actualizar_estado(
        self,
        session: Session,
        pedido_id: int,
        datos: PedidoCompraEstadoUpdate
    ) -> PedidoCompraRead:

        pedido = self.repository.obtener_por_id(
            session,
            pedido_id
        )

        if pedido is None:
            raise HTTPException(
                status_code=404,
                detail="Pedido de compra no encontrado"
            )

        if pedido.estado in (
            EstadoPedido.RECHAZADO,
            EstadoPedido.RECIBIDO,
        ):
            raise HTTPException(
                status_code=409,
                detail="El pedido está finalizado y no puede modificarse"
            )

        transiciones = {
            EstadoPedido.PENDIENTE: {
                EstadoPedido.COTIZACION,
                EstadoPedido.APROBADO,
                EstadoPedido.RECHAZADO,
            },
            EstadoPedido.COTIZACION: {
                EstadoPedido.APROBADO,
                EstadoPedido.RECHAZADO,
            },
            EstadoPedido.APROBADO: {
                EstadoPedido.RECIBIDO,
            },
        }

        if datos.estado not in transiciones.get(
            pedido.estado, set()
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    f"No se permite pasar de '{pedido.estado.value}' "
                    f"a '{datos.estado.value}'"
                )
            )


        # No permitir aprobar compras sin cotización válida.
        if datos.estado == EstadoPedido.APROBADO:
            if (
                not pedido.proveedor.strip()
                or pedido.monto_estimado <= 0
            ):
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "No se puede aprobar el pedido sin "
                        "registrar previamente un proveedor "
                        "y un monto estimado mayor a cero."
                    )
                )


        pedido.estado = datos.estado

        try:
            self.repository.actualizar(session, pedido)
            session.commit()
            session.refresh(pedido)

        except Exception:
            session.rollback()
            raise

        return self.convertir_a_read(session, pedido)

    
    def actualizar_cotizacion(
        self,
        session: Session,
        pedido_id: int,
        datos: PedidoCompraCotizacionUpdate
    ) -> PedidoCompraRead:

        pedido = self.repository.obtener_por_id(
            session,
            pedido_id
        )

        if pedido is None:
            raise HTTPException(
                status_code=404,
                detail="Pedido de compra no encontrado"
            )

        if pedido.estado != EstadoPedido.COTIZACION:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Solo se pueden registrar cotizaciones "
                    "en pedidos con estado 'En cotización'"
                )
            )

        pedido.proveedor = datos.proveedor.strip()
        pedido.monto_estimado = datos.monto_estimado

        try:
            self.repository.actualizar(session, pedido)
            session.commit()
            session.refresh(pedido)

        except Exception:
            session.rollback()
            raise

        return self.convertir_a_read(session, pedido)

