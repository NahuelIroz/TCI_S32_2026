
from sqlmodel import SQLModel, Field


class Repuesto(SQLModel, table=True):
    __tablename__ = "repuestos"

    id: int | None = Field(
        default=None,
        primary_key=True
    )

    codigo: str = Field(
        index=True,
        unique=True,
        max_length=50
    )

    nombre: str = Field(max_length=200)

    disponible: int = Field(default=0, ge=0)

    minimo: int = Field(default=0, ge=0)

    unidad: str = Field(
        default="unid.",
        max_length=30
    )

    ubicacion: str = Field(
        default="Sin ubicación",
        max_length=200
    )


class RepuestoRead(SQLModel):
    id: int
    codigo: str
    nombre: str
    disponible: int
    minimo: int
    unidad: str
    ubicacion: str
    estado: str
