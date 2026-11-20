
from fastapi import HTTPException
from sqlmodel import Session

from app.models.movimiento_stock import (
    MovimientoStock,
    TipoMovimientoStock,
    IngresoStockCreate,
    IngresoStockRead,
    MovimientoStockRead,
    ConsumoStockCreate,
    ConsumoStockRead,
)

from app.repositories.movimiento_stock_repository import (
    MovimientoStockRepository,
)

from sqlalchemy import func
from sqlmodel import select

from app.models.pedido_compra import (
    PedidoCompra,
    EstadoPedido,
)

from app.models.movimiento_stock import (
    RecepcionCompraCreate,
    RecepcionCompraRead,
)
from app.models.incidencia import Incidencia, EstadoIncidencia
from app.models.maquina import Maquina

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

    
    def registrar_consumo(
        self,
        session: Session,
        repuesto_id: int,
        datos: ConsumoStockCreate
    ) -> ConsumoStockRead:

        if not all([
            datos.maquina.strip(),
            datos.orden_trabajo.strip(),
            datos.motivo.strip(),
            datos.tecnico.strip()
        ]):
            raise HTTPException(
                status_code=422,
                detail="Los campos obligatorios no pueden estar vacíos"
            )

        # Verificar que la incidencia exista
        incidencia = session.get(
            Incidencia,
            datos.incidencia_id
        )

        if incidencia is None:
            raise HTTPException(
                status_code=404,
                detail="La incidencia seleccionada no existe"
            )

        # Solo se permiten consumos en incidencias en reparación
        if incidencia.estado != EstadoIncidencia.EN_REPARACION:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Solo se pueden registrar consumos "
                    "en incidencias que estén En reparación"
                )
            )

        # Obtener la máquina real asociada
        maquina_incidencia = session.get(
            Maquina,
            incidencia.maquina_id
        )

        if maquina_incidencia is None:
            raise HTTPException(
                status_code=404,
                detail="La máquina asociada a la incidencia no existe"
            )

        # Evitar inconsistencias entre máquina e incidencia
        if datos.maquina.strip() != maquina_incidencia.nombre:
            raise HTTPException(
                status_code=422,
                detail="La máquina no coincide con la incidencia seleccionada"
            )

        try:
            # 1. Obtener repuesto bloqueando su fila
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

            # 2. Verificar stock físico
            if datos.cantidad > repuesto.disponible:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Stock insuficiente. "
                        f"Disponible: {repuesto.disponible}. "
                        f"Solicitado: {datos.cantidad}."
                    )
                )

            stock_anterior = repuesto.disponible

            # 3. Descontar cantidad
            repuesto.disponible -= datos.cantidad

            session.add(repuesto)

            # 4. Registrar movimiento
            movimiento = MovimientoStock(
                repuesto_id=repuesto_id,
                incidencia_id=incidencia.id,
                tipo=TipoMovimientoStock.CONSUMO,
                cantidad=datos.cantidad,
                motivo=datos.motivo.strip(),
                maquina=maquina_incidencia.nombre,
                orden_trabajo=datos.orden_trabajo.strip(),
                tecnico=datos.tecnico.strip()
            )

            self.repository.crear_movimiento(
                session,
                movimiento
            )

            # 5. Confirmar ambas operaciones
            session.commit()

            session.refresh(movimiento)
            session.refresh(repuesto)

            return ConsumoStockRead(
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

    
    def registrar_recepcion_compra(
        self,
        session: Session,
        pedido_id: int,
        datos: RecepcionCompraCreate
    ) -> RecepcionCompraRead:

        if not all([
            datos.remito.strip(),
            datos.ubicacion.strip(),
            datos.proveedor.strip(),
            datos.tecnico_delegado.strip()
        ]):
            raise HTTPException(
                status_code=422,
                detail="Completá todos los campos obligatorios."
            )

        try:
            # 1. Bloquear el pedido para impedir que
            # dos recepciones simultáneas excedan
            # la cantidad solicitada.
            pedido = session.exec(
                select(PedidoCompra)
                .where(PedidoCompra.id == pedido_id)
                .with_for_update()
            ).first()

            if pedido is None:
                raise HTTPException(
                    status_code=404,
                    detail="Pedido de compra no encontrado."
                )

            if pedido.estado != EstadoPedido.APROBADO:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Solo se pueden recibir pedidos "
                        "con estado Aprobado."
                    )
                )

            # 2. Consultar las unidades ya recibidas.
            cantidad_recibida = session.exec(
                select(
                    func.coalesce(
                        func.sum(MovimientoStock.cantidad),
                        0
                    )
                ).where(
                    MovimientoStock.pedido_compra_id == pedido_id,
                    MovimientoStock.tipo == TipoMovimientoStock.INGRESO
                )
            ).one()

            cantidad_recibida = int(cantidad_recibida)

            cantidad_pendiente = (
                pedido.cantidad - cantidad_recibida
            )

            if datos.cantidad > cantidad_pendiente:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"El pedido tiene {cantidad_pendiente} "
                        "unidades pendientes de recepción. "
                        f"No se pueden recibir {datos.cantidad}."
                    )
                )

            # 3. Bloquear el repuesto asociado.
            repuesto = (
                self.repository.obtener_repuesto_para_actualizar(
                    session,
                    pedido.repuesto_id
                )
            )

            if repuesto is None:
                raise HTTPException(
                    status_code=404,
                    detail="Repuesto asociado no encontrado."
                )

            stock_anterior = repuesto.disponible

            # 4. Actualizar stock físico y ubicación.
            repuesto.disponible += datos.cantidad
            repuesto.ubicacion = datos.ubicacion.strip()

            session.add(repuesto)

            # 5. Crear movimiento vinculado al pedido.
            movimiento = MovimientoStock(
                repuesto_id=pedido.repuesto_id,
                pedido_compra_id=pedido.id,
                tipo=TipoMovimientoStock.INGRESO,
                cantidad=datos.cantidad,
                motivo="Recepción de compra RN-08",
                remito=datos.remito.strip(),
                ubicacion=datos.ubicacion.strip(),
                proveedor=datos.proveedor.strip(),
                tecnico_delegado=datos.tecnico_delegado.strip(),
                observaciones=datos.observaciones.strip()
            )

            session.add(movimiento)

            # 6. Calcular recepción acumulada.
            total_recibido = (
                cantidad_recibida + datos.cantidad
            )

            pendiente = pedido.cantidad - total_recibido

            # 7. Finalizar pedido solamente cuando
            # se haya recibido toda la cantidad.
            if pendiente == 0:
                pedido.estado = EstadoPedido.RECIBIDO
                session.add(pedido)

            # 8. Una única transacción para:
            # - movimiento
            # - actualización de stock
            # - actualización del pedido
            session.commit()

            session.refresh(movimiento)
            session.refresh(repuesto)
            session.refresh(pedido)

            return RecepcionCompraRead(
                movimiento=MovimientoStockRead.model_validate(
                    movimiento
                ),
                stock_anterior=stock_anterior,
                stock_actual=repuesto.disponible,
                pedido_compra_id=pedido.id,
                cantidad_solicitada=pedido.cantidad,
                cantidad_recibida_acumulada=total_recibido,
                cantidad_pendiente=pendiente,
                estado_pedido=pedido.estado.value
            )

        except Exception:
            session.rollback()
            raise

    
    def listar_recepciones_compra(
        self,
        session: Session,
        pedido_id: int
    ) -> list[MovimientoStockRead]:

        pedido = session.get(PedidoCompra, pedido_id)

        if pedido is None:
            raise HTTPException(
                status_code=404,
                detail="Pedido de compra no encontrado"
            )

        movimientos = session.exec(
            select(MovimientoStock)
            .where(
                MovimientoStock.pedido_compra_id == pedido_id,
                MovimientoStock.tipo == TipoMovimientoStock.INGRESO
            )
            .order_by(MovimientoStock.fecha.desc())
        ).all()

        return [
            MovimientoStockRead.model_validate(movimiento)
            for movimiento in movimientos
        ]


