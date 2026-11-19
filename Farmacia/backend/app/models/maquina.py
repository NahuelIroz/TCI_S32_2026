
from sqlmodel import SQLModel, Field


class Maquina(SQLModel, table=True):
    __tablename__ = "maquinas"

    id: int | None = Field(default=None, primary_key=True)

    codigo: str = Field(index=True, unique=True)
    nombre: str
    tipo: str
    sector: str

    estado: str = Field(default="OPERATIVA")

    # Campos de seguimiento (Tablero de Gerencia)
    criticidad: str = Field(default="Media", max_length=50)
    oee: float = Field(default=0.0, ge=0.0, le=100.0)
    temperatura: str = Field(default="N/D", max_length=30)
    presion: str = Field(default="N/D", max_length=30)
    horas_operacion: int = Field(default=0, ge=0)
    ultima_revision: str = Field(default="", max_length=50)
    proximo_mantenimiento: str = Field(default="", max_length=50)
    responsable: str = Field(default="Sin asignar", max_length=100)


class MaquinaRead(SQLModel):
    id: int
    codigo: str
    nombre: str
    tipo: str
    sector: str
    estado: str
    criticidad: str
    oee: float
    temperatura: str
    presion: str
    horas_operacion: int
    ultima_revision: str
    proximo_mantenimiento: str
    responsable: str
