from datetime import datetime
from sqlmodel import SQLModel


class ResumenMaquinas(SQLModel):
    total: int
    operativas: int
    en_alerta: int
    en_mantenimiento: int
    detenidas: int
    oee_promedio: float = 0.0


class IncidenciaTablero(SQLModel):
    id: int
    codigo: str
    maquina_id: int
    maquina_codigo: str
    maquina_nombre: str
    descripcion: str
    estado: str
    prioridad: str
    fecha_reporte: datetime
    turno: str
    tecnico: str


class TableroResumen(SQLModel):
    maquinas: ResumenMaquinas
    incidencias_activas: int
    incidencias: list[IncidenciaTablero]
