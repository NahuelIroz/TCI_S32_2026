
from enum import Enum

from sqlmodel import SQLModel, Field


class RolUsuario(str, Enum):
    OPERARIO = "OPERARIO"
    MANTENIMIENTO = "MANTENIMIENTO"
    ENCARGADO = "ENCARGADO"
    GERENCIA = "GERENCIA"


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: int | None = Field(default=None, primary_key=True)

    username: str = Field(index=True, unique=True)
    nombre: str

    password_hash: str

    rol: RolUsuario = Field(default=RolUsuario.OPERARIO)

    activo: bool = Field(default=True)
