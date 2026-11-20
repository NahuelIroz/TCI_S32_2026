
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.models.repuesto import (
    Repuesto,
    RepuestoRead,
    RepuestoCreate,
    RepuestoUpdate,
)
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

    def convertir_respuesta(self, repuesto: Repuesto) -> RepuestoRead:
        return RepuestoRead(
            id=repuesto.id,
            codigo=repuesto.codigo,
            nombre=repuesto.nombre,
            disponible=repuesto.disponible,
            minimo=repuesto.minimo,
            unidad=repuesto.unidad,
            ubicacion=repuesto.ubicacion,
            estado=self.calcular_estado(repuesto),
            activo=repuesto.activo,
        )

    def listar(
        self,
        session: Session,
        buscar: str | None = None,
        incluir_inactivos: bool = False,
    ) -> list[RepuestoRead]:

        repuestos = self.repository.listar(
            session,
            buscar,
            incluir_inactivos
        )

        return [self.convertir_respuesta(r) for r in repuestos]

    def obtener_por_id(
        self,
        session: Session,
        repuesto_id: int
    ) -> RepuestoRead:

        repuesto = self.repository.obtener_por_id(session, repuesto_id)

        if repuesto is None:
            raise HTTPException(404, "Repuesto no encontrado")

        return self.convertir_respuesta(repuesto)

    def obtener_por_codigo(
        self,
        session: Session,
        codigo: str
    ) -> RepuestoRead:

        repuesto = self.repository.obtener_por_codigo(session, codigo)

        if repuesto is None:
            raise HTTPException(
                404,
                f"No se encontró ningún repuesto con el código '{codigo}'"
            )

        return self.convertir_respuesta(repuesto)

    def crear(
        self,
        session: Session,
        datos: RepuestoCreate
    ) -> RepuestoRead:

        codigo = datos.codigo.strip()
        nombre = datos.nombre.strip()

        if not codigo or not nombre:
            raise HTTPException(422, "Código y nombre son obligatorios")

        if self.repository.obtener_por_codigo(session, codigo):
            raise HTTPException(409, "Ya existe un repuesto con ese código")

        repuesto = Repuesto(
            **datos.model_dump(exclude={"codigo", "nombre"}),
            codigo=codigo,
            nombre=nombre,
            disponible=0,
            activo=True,
        )

        try:
            repuesto = self.repository.crear(session, repuesto)
        except IntegrityError as error:
            session.rollback()
            raise HTTPException(
                409, "Ya existe un repuesto con ese código"
            ) from error

        return self.convertir_respuesta(repuesto)

    def actualizar(
        self,
        session: Session,
        repuesto_id: int,
        datos: RepuestoUpdate
    ) -> RepuestoRead:

        repuesto = self.repository.obtener_por_id(session, repuesto_id)

        if repuesto is None:
            raise HTTPException(404, "Repuesto no encontrado")

        cambios = datos.model_dump(exclude_unset=True)

        for campo in ("codigo", "nombre"):
            if campo in cambios:
                valor = cambios[campo]
                if valor is None or not valor.strip():
                    raise HTTPException(422, f"El campo {campo} es obligatorio")
                cambios[campo] = valor.strip()

        if "codigo" in cambios:
            existente = self.repository.obtener_por_codigo(
                session, cambios["codigo"]
            )
            if existente is not None and existente.id != repuesto_id:
                raise HTTPException(409, "Ya existe otro repuesto con ese código")

        for campo, valor in cambios.items():
            if valor is None:
                raise HTTPException(422, f"El campo {campo} no admite null")
            setattr(repuesto, campo, valor)

        try:
            repuesto = self.repository.actualizar(session, repuesto)
        except IntegrityError as error:
            session.rollback()
            raise HTTPException(
                409, "Ya existe otro repuesto con ese código"
            ) from error

        return self.convertir_respuesta(repuesto)

    def cambiar_activo(
        self,
        session: Session,
        repuesto_id: int,
        activo: bool
    ) -> RepuestoRead:

        repuesto = self.repository.obtener_por_id(session, repuesto_id)

        if repuesto is None:
            raise HTTPException(404, "Repuesto no encontrado")

        repuesto.activo = activo
        repuesto = self.repository.actualizar(session, repuesto)

        return self.convertir_respuesta(repuesto)



def seed_repuestos_si_no_existen(session: Session) -> None:
    """
    Inserta los repuestos iniciales solamente si no existen.
    No modifica repuestos existentes ni sus cantidades de stock.
    """

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

    for repuesto in repuestos_base:

        existente = session.exec(
            select(Repuesto).where(
                Repuesto.codigo == repuesto.codigo
            )
        ).first()

        if existente is None:
            session.add(repuesto)

    session.commit()
