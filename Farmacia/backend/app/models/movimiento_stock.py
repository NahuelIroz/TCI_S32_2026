
from datetime import datetime, timezone
from enum import Enum

from sqlmodel import SQLModel, Field


class TipoMovimientoStock(str, Enum):
    INGRESO = "INGRESO"
    CONSUMO = "CONSUMO"
    AJUSTE = "AJUSTE"


class MovimientoStock(SQLModel, table=True):
    __tablename__ = "movimientos_stock"

    id: int | None = Field(default=None, primary_key=True)

    repuesto_id: int = Field(
        foreign_key="repuestos.id",
        index=True
    )

    tipo: TipoMovimientoStock

    cantidad: int = Field(gt=0)

    motivo: str = Field(max_length=300)

    fecha: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    remito: str | None = Field(default=None, max_length=100)

    ubicacion: str | None = Field(default=None, max_length=200)

    proveedor: str | None = Field(default=None, max_length=200)

    tecnico_delegado: str | None = Field(
        default=None,
        max_length=200
    )

    observaciones: str | None = Field(default=None)


class IngresoStockCreate(SQLModel):
    cantidad: int = Field(gt=0)

    remito: str = Field(min_length=1, max_length=100)

    ubicacion: str = Field(min_length=1, max_length=200)

    proveedor: str = Field(min_length=1, max_length=200)

    tecnico_delegado: str = Field(
        min_length=1,
        max_length=200
    )

    observaciones: str = ""


class MovimientoStockRead(SQLModel):
    id: int
    repuesto_id: int
    tipo: TipoMovimientoStock
    cantidad: int
    motivo: str
    fecha: datetime

    remito: str | None
    ubicacion: str | None
    proveedor: str | None
    tecnico_delegado: str | None
    observaciones: str | None


class IngresoStockRead(SQLModel):
    movimiento: MovimientoStockRead
    stock_anterior: int
    stock_actual: int
