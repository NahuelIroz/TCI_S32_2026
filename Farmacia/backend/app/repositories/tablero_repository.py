"""Capa de persistencia para el Tablero de Seguimiento (Gerencia).

Consulta el estado operativo de máquinas e incidencias en planta.
"""

from sqlmodel import Session, select

from app.models.incidencia import Incidencia, EstadoIncidencia
from app.models.maquina import Maquina
from app.models.usuario import Usuario


class TableroRepository:

    def __init__(self, session: Session):
        self.session = session

    def obtener_maquinas(self) -> list[Maquina]:
        """Obtiene todas las máquinas de la planta."""
        statement = select(Maquina).order_by(Maquina.nombre)
        return list(self.session.exec(statement).all())

    def obtener_incidencias_activas(self) -> list[tuple[Incidencia, Maquina | None, Usuario | None]]:
        """
        Obtiene las incidencias abiertas que requieren seguimiento en planta,
        excluyendo aquellas ya resueltas, cerradas o rechazadas.
        """
        estados_inactivos = [
            EstadoIncidencia.RESUELTA,
            EstadoIncidencia.CERRADA,
            EstadoIncidencia.RECHAZADA,
        ]

        statement = (
            select(Incidencia, Maquina, Usuario)
            .join(Maquina, Incidencia.maquina_id == Maquina.id, isouter=True)
            .join(Usuario, Incidencia.usuario_reportante_id == Usuario.id, isouter=True)
            .where(Incidencia.estado.notin_(estados_inactivos))
            .order_by(Incidencia.fecha_reporte.desc())
        )

        return list(self.session.exec(statement).all())
