from datetime import datetime

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.repuesto import Repuesto
from app.models.pedido_compra import (
    PedidoCompra,
    PedidoCompraCreate,
    PedidoCompraRead,
    PedidoCompraEstadoUpdate,
    EstadoPedido,
    PrioridadPedido,
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

    def decision_gerencia(
        self,
        session: Session,
        pedido_id: int,
        nuevo_estado: EstadoPedido,
    ) -> PedidoCompraRead:
        pedido = self.repository.obtener_por_id(session, pedido_id)

        if pedido is None:
            raise HTTPException(
                status_code=404,
                detail="Pedido de compra no encontrado",
            )

        if pedido.estado == EstadoPedido.RECIBIDO:
            raise HTTPException(
                status_code=409,
                detail="El pedido ya fue recibido en depósito y no puede modificarse",
            )

        if nuevo_estado not in (EstadoPedido.APROBADO, EstadoPedido.RECHAZADO):
            raise HTTPException(
                status_code=422,
                detail="La decisión de Gerencia debe ser 'Aprobado' o 'Rechazado'",
            )

        pedido.estado = nuevo_estado
        pedido.notificacion_leida = True

        try:
            self.repository.actualizar(session, pedido)
            session.commit()
            session.refresh(pedido)
        except Exception:
            session.rollback()
            raise

        return self.convertir_a_read(session, pedido)

    def aprobar_todos_pendientes(
        self,
        session: Session,
    ) -> list[PedidoCompraRead]:
        pendientes = self.repository.listar_por_estados(
            session,
            [EstadoPedido.PENDIENTE, EstadoPedido.COTIZACION],
        )

        try:
            for pedido in pendientes:
                pedido.estado = EstadoPedido.APROBADO
                pedido.notificacion_leida = True
                self.repository.actualizar(session, pedido)
            session.commit()
        except Exception:
            session.rollback()
            raise

        return self.listar(session)

    def marcar_notificacion_leida(
        self,
        session: Session,
        pedido_id: int,
        leida: bool = True,
    ) -> PedidoCompraRead:
        pedido = self.repository.obtener_por_id(session, pedido_id)

        if pedido is None:
            raise HTTPException(
                status_code=404,
                detail="Pedido de compra no encontrado",
            )

        pedido.notificacion_leida = leida

        try:
            self.repository.actualizar(session, pedido)
            session.commit()
            session.refresh(pedido)
        except Exception:
            session.rollback()
            raise

        return self.convertir_a_read(session, pedido)

    def marcar_todas_notificaciones_leidas(
        self,
        session: Session,
    ) -> list[PedidoCompraRead]:
        no_leidos = self.repository.listar_no_leidos(session)

        try:
            for pedido in no_leidos:
                pedido.notificacion_leida = True
                self.repository.actualizar(session, pedido)
            session.commit()
        except Exception:
            session.rollback()
            raise

        return self.listar(session)


PEDIDOS_SEMILLA = [
    {
        "repuesto_codigo": "SKU-COR-900",
        "cantidad": 5,
        "prioridad": PrioridadPedido.URGENTE,
        "justificacion": "Stock agotado (0 unid.), requerida para compresores principales.",
        "estado": EstadoPedido.PENDIENTE,
        "solicitante": "Carlos Gómez (Mantenimiento)",
        "monto_estimado": 45000.0,
        "proveedor": "Transmisiones Industriales S.A.",
        "notificacion_leida": False,
    },
    {
        "repuesto_codigo": "SKU-VLV-420",
        "cantidad": 10,
        "prioridad": PrioridadPedido.MEDIA,
        "justificacion": "Stock crítico (2 unid. restantes sobre mínimo de 5).",
        "estado": EstadoPedido.COTIZACION,
        "solicitante": "Carlos Gómez (Mantenimiento)",
        "monto_estimado": 185000.0,
        "proveedor": "Festo Neumática Argentina",
        "notificacion_leida": False,
    },
    {
        "repuesto_codigo": "SKU-6204-2R",
        "cantidad": 20,
        "prioridad": PrioridadPedido.MEDIA,
        "justificacion": "Reposición periódica para mantenimiento preventivo anual.",
        "estado": EstadoPedido.APROBADO,
        "solicitante": "Ing. Martín Bianchi (Encargado)",
        "monto_estimado": 120000.0,
        "proveedor": "Rodamientos del Plata SRL",
        "notificacion_leida": True,
    },
    {
        "repuesto_codigo": "SKU-FLT-880",
        "cantidad": 8,
        "prioridad": PrioridadPedido.BAJA,
        "justificacion": "Reposición de stock para segundo semestre.",
        "estado": EstadoPedido.RECIBIDO,
        "solicitante": "Ing. Martín Bianchi (Encargado)",
        "monto_estimado": 96000.0,
        "proveedor": "Aire Comprimido Tech",
        "notificacion_leida": True,
    },
]


def seed_pedidos_compra_si_no_existen(session: Session) -> None:
    existente = session.exec(select(PedidoCompra)).first()
    if existente is not None:
        return

    for datos in PEDIDOS_SEMILLA:
        repuesto = session.exec(
            select(Repuesto).where(Repuesto.codigo == datos["repuesto_codigo"])
        ).first()
        if repuesto is None or repuesto.id is None:
            continue

        nuevo = PedidoCompra(
            repuesto_id=repuesto.id,
            cantidad=datos["cantidad"],
            prioridad=datos["prioridad"],
            justificacion=datos["justificacion"],
            estado=datos["estado"],
            solicitante=datos["solicitante"],
            monto_estimado=datos["monto_estimado"],
            proveedor=datos["proveedor"],
            notificacion_leida=datos["notificacion_leida"],
        )
        session.add(nuevo)

    session.commit()
