from datetime import datetime, timezone
from sqlalchemy import Column, DateTime
from sqlmodel import SQLModel, Field

class FotoIncidencia(SQLModel, table=True):
    __tablename__ = "incidencia_fotos"
    id: int | None = Field(default=None, primary_key=True)
    incidencia_id: int = Field(foreign_key="incidencias.id", index=True)
    nombre_archivo: str
    fecha_subida: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), sa_column=Column(DateTime(timezone=True), nullable=False))

class FotoIncidenciaRead(SQLModel):
    id: int
    incidencia_id: int
    nombre_archivo: str
    fecha_subida: datetime
    url: str
