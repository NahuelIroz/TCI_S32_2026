
from app.models.maquina import Maquina
from app.repositories.maquina_repository import MaquinaRepository


class MaquinaService:

    def __init__(self, repository: MaquinaRepository):
        self.repository = repository

    def listar(self) -> list[Maquina]:
        return self.repository.listar()

    def obtener_por_id(self, maquina_id: int) -> Maquina:
        maquina = self.repository.obtener_por_id(maquina_id)

        if maquina is None:
            raise ValueError("La máquina no existe")

        return maquina
