
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

    def obtener_por_codigo(
        self,
        session: Session,
        codigo: str
    ) -> RepuestoRead:

        repuesto = self.repository.obtener_por_codigo(
            session,
            codigo
        )

        if repuesto is None:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontró ningún repuesto con el código '{codigo}'"
            )

        return self.convertir_respuesta(repuesto)


def seed_repuestos_si_no_existen(session: Session) -> None:
    """Inserta los repuestos base del catálogo si no existen en la base de datos."""
    from sqlmodel import select

    repuestos_base = [
        Repuesto(
            codigo="SKU-6204-2R",
            nombre="Rodamiento Rígido de Bolas SKF 6204-2RSH",
            disponible=28,
            minimo=10,
            unidad="unid.",
            ubicacion="Pasillo A · Estante 2 (Nivel 1)",
        ),
        Repuesto(
            codigo="SKU-VLV-420",
            nombre="Válvula Solenoide Festo 24V DC 5/2",
            disponible=2,
            minimo=5,
            unidad="unid.",
            ubicacion="Pasillo B · Gabinete 4 (Nivel 3)",
        ),
        Repuesto(
            codigo="SKU-FLT-880",
            nombre="Filtro de Aire Compresor Atlas Copco",
            disponible=15,
            minimo=4,
            unidad="unid.",
            ubicacion="Pasillo A · Estante 1 (Nivel 2)",
        ),
        Repuesto(
            codigo="SKU-COR-900",
            nombre="Correa Dentada Sincrónica 8M",
            disponible=0,
            minimo=3,
            unidad="unid.",
            ubicacion="Pasillo C · Estante 3 (Nivel 1)",
        ),
    ]

    for r in repuestos_base:
        existente = session.exec(
            select(Repuesto).where(Repuesto.codigo == r.codigo)
        ).first()
        if not existente:
            session.add(r)

    session.commit()
