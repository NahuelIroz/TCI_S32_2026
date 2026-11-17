
from sqlmodel import SQLModel, Field


class Maquina(SQLModel, table=True):
    __tablename__ = "maquinas"

    id: int | None = Field(default=None, primary_key=True)

    codigo: str = Field(index=True, unique=True)
    nombre: str
    tipo: str
    sector: str

    estado: str = Field(default="OPERATIVA")
