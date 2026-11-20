
from sqlmodel import Session, select
from sqlalchemy import or_

from app.models.repuesto import Repuesto


class RepuestoRepository:

    def listar(
        self,
        session: Session,
        buscar: str | None = None,
        incluir_inactivos: bool = False
    ) -> list[Repuesto]:

        consulta = select(Repuesto)

        if not incluir_inactivos:
            consulta = consulta.where(Repuesto.activo == True)

        if buscar and buscar.strip():
            texto = f"%{buscar.strip()}%"
            consulta = consulta.where(
                or_(
                    Repuesto.codigo.ilike(texto),
                    Repuesto.nombre.ilike(texto)
                )
            )

        consulta = consulta.order_by(Repuesto.nombre)

        return list(session.exec(consulta).all())

    def obtener_por_id(
        self,
        session: Session,
        repuesto_id: int
    ) -> Repuesto | None:
        return session.get(Repuesto, repuesto_id)

    def obtener_por_codigo(
        self,
        session: Session,
        codigo: str
    ) -> Repuesto | None:

        consulta = select(Repuesto).where(
            Repuesto.codigo.ilike(codigo.strip())
        )

        return session.exec(consulta).first()

    def crear(
        self,
        session: Session,
        repuesto: Repuesto
    ) -> Repuesto:

        session.add(repuesto)
        session.commit()
        session.refresh(repuesto)
        return repuesto

    def actualizar(
        self,
        session: Session,
        repuesto: Repuesto
    ) -> Repuesto:

        session.add(repuesto)
        session.commit()
        session.refresh(repuesto)
        return repuesto
