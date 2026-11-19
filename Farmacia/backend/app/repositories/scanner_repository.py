"""Repositorio para búsqueda y resolución de códigos escaneados."""

from sqlmodel import Session, select
from app.models.repuesto import Repuesto
from app.models.maquina import Maquina


class ScannerRepository:

    def buscar_repuesto(
        self,
        session: Session,
        codigo: str
    ) -> Repuesto | None:
        statement = select(Repuesto).where(
            Repuesto.codigo.ilike(codigo.strip())
        )
        return session.exec(statement).first()

    def buscar_maquina(
        self,
        session: Session,
        codigo: str
    ) -> Maquina | None:
        statement = select(Maquina).where(
            Maquina.codigo.ilike(codigo.strip())
        )
        return session.exec(statement).first()
