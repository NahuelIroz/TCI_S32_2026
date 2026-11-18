
from fastapi import HTTPException
from sqlmodel import Session

from app.models.repuesto import Repuesto, RepuestoRead
from app.repositories.repuesto_repository import RepuestoRepository


class RepuestoService:

    def __init__(self):
        self.repository = RepuestoRepository()

    def calcular_estado(self, repuesto: Repuesto) -> str:

        if repuesto.disponible == 0:
            return "Agotado"

        if repuesto.disponible <= repuesto.minimo:
            return "Stock Bajo"

        return "Disponible"

    def convertir_respuesta(
        self,
        repuesto: Repuesto
    ) -> RepuestoRead:

        return RepuestoRead(
            id=repuesto.id,
            codigo=repuesto.codigo,
            nombre=repuesto.nombre,
            disponible=repuesto.disponible,
            minimo=repuesto.minimo,
            unidad=repuesto.unidad,
            ubicacion=repuesto.ubicacion,
            estado=self.calcular_estado(repuesto)
        )

    def listar(
        self,
        session: Session,
        buscar: str | None = None
    ) -> list[RepuestoRead]:

        repuestos = self.repository.listar(
            session,
            buscar
        )

        return [
            self.convertir_respuesta(repuesto)
            for repuesto in repuestos
        ]

    def obtener_por_id(
        self,
        session: Session,
        repuesto_id: int
    ) -> RepuestoRead:

        repuesto = self.repository.obtener_por_id(
            session,
            repuesto_id
        )

        if repuesto is None:
            raise HTTPException(
                status_code=404,
                detail="Repuesto no encontrado"
            )

        return self.convertir_respuesta(repuesto)
