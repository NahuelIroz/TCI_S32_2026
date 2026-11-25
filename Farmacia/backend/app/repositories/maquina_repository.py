
from sqlmodel import Session, select

from app.models.maquina import Maquina


class MaquinaRepository:

    def __init__(self, session: Session):
        self.session = session

    def listar(
        self,
        incluir_inactivas: bool = False,
        estado: str | None = None,
        sector: str | None = None,
    ) -> list[Maquina]:

        statement = select(Maquina)

        if not incluir_inactivas:
            statement = statement.where(Maquina.activo == True)

        if estado:
            statement = statement.where(Maquina.estado.ilike(estado.strip()))

        if sector:
            statement = statement.where(Maquina.sector.ilike(sector.strip()))

        statement = statement.order_by(Maquina.nombre)

        return list(self.session.exec(statement).all())

    def obtener_por_id(
        self,
        maquina_id: int
    ) -> Maquina | None:
        return self.session.get(Maquina, maquina_id)

    def obtener_por_codigo(
        self,
        codigo: str
    ) -> Maquina | None:

        statement = select(Maquina).where(
            Maquina.codigo == codigo
        )

        return self.session.exec(statement).first()

    def crear(self, maquina: Maquina) -> Maquina:
        try:
            self.session.add(maquina)
            self.session.commit()
            self.session.refresh(maquina)
            return maquina
        except Exception:
            self.session.rollback()
            raise

    def actualizar(self, maquina: Maquina) -> Maquina:
        try:
            self.session.add(maquina)
            self.session.commit()
            self.session.refresh(maquina)
            return maquina
        except Exception:
            self.session.rollback()
            raise
