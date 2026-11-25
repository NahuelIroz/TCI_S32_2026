from enum import Enum
from sqlmodel import SQLModel, Field


class EstadoTarea(str, Enum):
    PENDIENTE = "Pendiente"
    EN_CURSO = "En Curso"
    COMPLETADA = "Completada"
    DEMORADA = "Demorada"


class PrioridadTarea(str, Enum):
    ALTA = "Alta"
    MEDIA = "Media"
    BAJA = "Baja"


class TipoTarea(str, Enum):
    PREVENTIVO = "Preventivo"
    CORRECTIVO = "Correctivo"
    PREDICTIVO = "Predictivo"


class Tarea(SQLModel, table=True):
    __tablename__ = "tareas"

    id: int | None = Field(default=None, primary_key=True)
    codigo: str = Field(index=True, unique=True, max_length=50)
    titulo: str = Field(max_length=200)
    descripcion: str
    maquina_id: int = Field(foreign_key="maquinas.id")
    tecnico_asignado_id: int | None = Field(default=None, foreign_key="usuarios.id")
    prioridad: PrioridadTarea = Field(default=PrioridadTarea.MEDIA)
    tipo: TipoTarea = Field(default=TipoTarea.PREVENTIVO)
    estado: EstadoTarea = Field(default=EstadoTarea.PENDIENTE)
    fecha_limite: str = Field(default="", max_length=50)
    progreso: int = Field(default=0, ge=0, le=100)
    observaciones: str | None = Field(default=None)


class TareaCreate(SQLModel):
    codigo: str = Field(min_length=1, max_length=50)
    titulo: str = Field(min_length=1, max_length=200)
    descripcion: str
    maquina_id: int
    tecnico_asignado_id: int | None = None
    prioridad: PrioridadTarea = PrioridadTarea.MEDIA
    tipo: TipoTarea = TipoTarea.PREVENTIVO
    estado: EstadoTarea = EstadoTarea.PENDIENTE
    fecha_limite: str = ""
    progreso: int = 0
    observaciones: str | None = None


class TareaRead(SQLModel):
    id: int
    codigo: str
    titulo: str
    descripcion: str
    maquina_id: int
    maquina: str
    codigo_maquina: str
    tecnico_asignado_id: int | None
    tecnico_asignado: str
    prioridad: PrioridadTarea
    tipo: TipoTarea
    estado: EstadoTarea
    fecha_limite: str
    progreso: int
    observaciones: str | None
