
from sqlmodel import SQLModel, Field


class MaquinaBase(SQLModel):
    codigo: str = Field(min_length=1, max_length=50)
    nombre: str = Field(min_length=1, max_length=200)
    tipo: str = Field(min_length=1, max_length=100)
    sector: str = Field(min_length=1, max_length=200)
    estado: str = Field(default="Operativa", max_length=100)

    criticidad: str = Field(default="Media", max_length=50)
    oee: float = Field(default=0.0, ge=0.0, le=100.0)
    temperatura: str = Field(default="N/D", max_length=30)
    presion: str = Field(default="N/D", max_length=30)
    horas_operacion: int = Field(default=0, ge=0)
    ultima_revision: str = Field(default="", max_length=50)
    proximo_mantenimiento: str = Field(default="", max_length=50)
    responsable: str = Field(default="Sin asignar", max_length=100)


class Maquina(MaquinaBase, table=True):
    __tablename__ = "maquinas"

    id: int | None = Field(default=None, primary_key=True)
    codigo: str = Field(index=True, unique=True, max_length=50)
    activo: bool = Field(default=True)


class MaquinaCreate(MaquinaBase):
    pass


class MaquinaUpdate(SQLModel):
    codigo: str | None = Field(default=None, max_length=50)
    nombre: str | None = Field(default=None, max_length=200)
    tipo: str | None = Field(default=None, max_length=100)
    sector: str | None = Field(default=None, max_length=200)
    estado: str | None = Field(default=None, max_length=100)
    criticidad: str | None = Field(default=None, max_length=50)
    oee: float | None = Field(default=None, ge=0.0, le=100.0)
    temperatura: str | None = Field(default=None, max_length=30)
    presion: str | None = Field(default=None, max_length=30)
    horas_operacion: int | None = Field(default=None, ge=0)
    ultima_revision: str | None = Field(default=None, max_length=50)
    proximo_mantenimiento: str | None = Field(default=None, max_length=50)
    responsable: str | None = Field(default=None, max_length=100)


class MaquinaActivoUpdate(SQLModel):
    activo: bool


class MaquinaRead(MaquinaBase):
    id: int
    activo: bool


class RepuestoBOMRead(SQLModel):
    id: int
    codigo: str
    nombre: str
    minimo_sugerido: int
    unidad: str
    ubicacion_sugerida: str


class MaquinaAltaBOMRead(SQLModel):
    maquina: MaquinaRead
    repuestos_generados: list[RepuestoBOMRead]

