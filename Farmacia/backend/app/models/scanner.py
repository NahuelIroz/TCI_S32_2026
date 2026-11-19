"""Modelos y esquemas para la resolución de códigos QR en el escáner."""

from enum import Enum
from pydantic import BaseModel
from app.models.repuesto import RepuestoRead
from app.models.maquina import Maquina


class TipoEntidadQR(str, Enum):
    REPUESTO = "REPUESTO"
    MAQUINA = "MAQUINA"
    DESCONOCIDO = "DESCONOCIDO"


class ScannerResultado(BaseModel):
    codigo: str
    encontrado: bool
    tipo: TipoEntidadQR
    mensaje: str
    repuesto: RepuestoRead | None = None
    maquina: Maquina | None = None
