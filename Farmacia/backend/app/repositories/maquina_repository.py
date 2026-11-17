
from sqlmodel import Session, select

from app.models.maquina import Maquina


class MaquinaRepository:

    def __init__(self, session: Session):
        self.session = session

    def listar(self) -> list[Maquina]:
        statement = select(Maquina).order_by(Maquina.nombre)
        return list(self.session.exec(statement).all())

    def obtener_por_id(self, maquina_id: int) -> Maquina | None:
        return self.session.get(Maquina, maquina_id)
