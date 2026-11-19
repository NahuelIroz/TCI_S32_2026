
from datetime import datetime, timezone
from enum import Enum

from pydantic import ConfigDict, field_validator
from sqlmodel import SQLModel, Field


class PrioridadPedido(str, Enum):
    BAJA = "Baja"
    MEDIA = "Media"
    URGENTE = "Urgente"


class EstadoPedido(str, Enum):
    PENDIENTE = "Pendiente de aprobación"
    COTIZACION = "En cotización"
    APROBADO = "Aprobado"
    RECHAZADO = "Rechazado"
    RECIBIDO = "Recibido"


class PedidoCompra(SQLModel, table=True):
    __tablename__ = "pedidos_compra"

    id: int | None = Field(default=None, primary_key=True)

    repuesto_id: int = Field(
        foreign_key="repuestos.id",
        index=True
    )

    cantidad: int = Field(gt=0)

    prioridad: PrioridadPedido

    justificacion: str = Field(max_length=1000)

    estado: EstadoPedido = Field(
        default=EstadoPedido.PENDIENTE
    )

    fecha: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    solicitante: str = Field(max_length=200)

    monto_estimado: float = Field(default=0, ge=0)

    proveedor: str = Field(
        default="",
        max_length=200
    )

    notificacion_leida: bool = Field(default=False)


class PedidoCompraCreate(SQLModel):
    repuesto_id: int = Field(gt=0)
    cantidad: int = Field(gt=0)
    prioridad: PrioridadPedido
    justificacion: str = Field(min_length=1, max_length=1000)
    solicitante: str = Field(min_length=1, max_length=200)
    monto_estimado: float = Field(default=0, ge=0)
    proveedor: str = Field(default="", max_length=200)

    @field_validator("justificacion", "solicitante")
    @classmethod
    def validar_texto(cls, valor: str) -> str:
        valor = valor.strip()

        if not valor:
            raise ValueError("El campo no puede estar vacío")

        return valor


class PedidoCompraEstadoUpdate(SQLModel):
    estado: EstadoPedido


class PedidoCompraRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    codigo_pedido: str

    repuesto_id: int
    codigo: str
    repuesto_nombre: str
    unidad: str

    cantidad: int
    prioridad: PrioridadPedido
    justificacion: str
    estado: EstadoPedido
    fecha: datetime
    solicitante: str
    monto_estimado: float
    proveedor: str
    notificacion_leida: bool
