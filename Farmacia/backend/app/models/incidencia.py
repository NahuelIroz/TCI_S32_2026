
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime
from sqlmodel import SQLModel, Field


class EstadoIncidencia(str, Enum):
    REPORTADA = "REPORTADA"
    EN_TRIAGE = "EN_TRIAGE"
    EN_REPARACION = "EN_REPARACION"
    RESUELTA = "RESUELTA"
    CERRADA = "CERRADA"
    RECHAZADA = "RECHAZADA"


class Turno(str, Enum):
    MANANA = "Mañana"
    TARDE = "Tarde"
    NOCHE = "Noche"


class PrioridadIncidencia(str, Enum):
    BAJA = "BAJA"
    MEDIA = "MEDIA"
    ALTA = "ALTA"
    CRITICA = "CRITICA"


class Incidencia(SQLModel, table=True):
    __tablename__ = "incidencias"

    id: int | None = Field(default=None, primary_key=True)

    codigo: str = Field(index=True, unique=True)

    maquina_id: int = Field(foreign_key="maquinas.id")

    usuario_reportante_id: int = Field(
        foreign_key="usuarios.id"
    )

    descripcion: str

    turno: Turno

    prioridad: PrioridadIncidencia = Field(
        default=PrioridadIncidencia.MEDIA
    )

    estado: EstadoIncidencia = Field(
        default=EstadoIncidencia.REPORTADA
    )

    fecha_reporte: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
