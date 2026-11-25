
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models.maquina import (
    Maquina,
    MaquinaAltaBOMRead,
    MaquinaCreate,
    MaquinaRead,
    MaquinaUpdate,
    RepuestoBOMRead,
)
from app.models.repuesto import Repuesto
from app.repositories.maquina_repository import MaquinaRepository


class MaquinaService:

    def __init__(self, repository: MaquinaRepository):
        self.repository = repository

    def listar(
        self,
        incluir_inactivas: bool = False,
        estado: str | None = None,
        sector: str | None = None,
    ) -> list[Maquina]:
        return self.repository.listar(
            incluir_inactivas=incluir_inactivas,
            estado=estado,
            sector=sector,
        )

    def obtener_por_id(self, maquina_id: int) -> Maquina:
        maquina = self.repository.obtener_por_id(maquina_id)

        if maquina is None:
            raise ValueError("La máquina no existe")

        return maquina

    def crear(self, datos: MaquinaCreate) -> Maquina:
        valores = datos.model_dump()

        for campo in ("codigo", "nombre", "tipo", "sector"):
            valores[campo] = valores[campo].strip()
            if not valores[campo]:
                raise HTTPException(
                    status_code=422,
                    detail=f"El campo {campo} es obligatorio"
                )

        if self.repository.obtener_por_codigo(valores["codigo"]):
            raise HTTPException(
                status_code=409,
                detail="Ya existe una máquina con ese código"
            )

        maquina = Maquina(**valores, activo=True)

        try:
            return self.repository.crear(maquina)
        except IntegrityError as error:
            raise HTTPException(
                status_code=409,
                detail="Ya existe una máquina con ese código"
            ) from error

    def actualizar(
        self,
        maquina_id: int,
        datos: MaquinaUpdate
    ) -> Maquina:

        maquina = self.obtener_por_id(maquina_id)
        cambios = datos.model_dump(exclude_unset=True)

        for campo, valor in cambios.items():
            if valor is None:
                raise HTTPException(
                    status_code=422,
                    detail=f"El campo {campo} no admite null"
                )

            if campo in ("codigo", "nombre", "tipo", "sector"):
                valor = valor.strip()
                if not valor:
                    raise HTTPException(
                        status_code=422,
                        detail=f"El campo {campo} es obligatorio"
                    )
                cambios[campo] = valor

        if "codigo" in cambios:
            existente = self.repository.obtener_por_codigo(
                cambios["codigo"]
            )

            if existente is not None and existente.id != maquina_id:
                raise HTTPException(
                    status_code=409,
                    detail="Ya existe otra máquina con ese código"
                )

        for campo, valor in cambios.items():
            setattr(maquina, campo, valor)

        try:
            return self.repository.actualizar(maquina)
        except IntegrityError as error:
            raise HTTPException(
                status_code=409,
                detail="Ya existe otra máquina con ese código"
            ) from error

    def cambiar_activo(
        self,
        maquina_id: int,
        activo: bool
    ) -> Maquina:

        maquina = self.obtener_por_id(maquina_id)
        maquina.activo = activo

        return self.repository.actualizar(maquina)

    def crear_con_bom(self, datos: MaquinaCreate) -> MaquinaAltaBOMRead:
        maquina = self.crear(datos)
        session = self.repository.session

        plantilla_bom = [
            {
                "codigo": f"SKU-{maquina.codigo}-ROD",
                "nombre": f"Rodamiento de Precisión Alta Temp. para {maquina.nombre}",
                "minimo": 4,
                "unidad": "unid.",
                "ubicacion": "Pasillo B · Estante 1",
            },
            {
                "codigo": f"SKU-{maquina.codigo}-COR",
                "nombre": f"Correa Sincrónica Reforzada para {maquina.nombre}",
                "minimo": 2,
                "unidad": "unid.",
                "ubicacion": "Pasillo C · Estante 2",
            },
            {
                "codigo": f"SKU-{maquina.codigo}-VLV",
                "nombre": f"Válvula Reguladora de Flujo 24V para {maquina.nombre}",
                "minimo": 3,
                "unidad": "unid.",
                "ubicacion": "Pasillo B · Gabinete 3",
            },
        ]

        repuestos_creados: list[RepuestoBOMRead] = []
        for item in plantilla_bom:
            existente = session.exec(
                select(Repuesto).where(Repuesto.codigo == item["codigo"])
            ).first()
            if existente is None:
                nuevo_rep = Repuesto(
                    codigo=item["codigo"],
                    nombre=item["nombre"],
                    disponible=item["minimo"],
                    minimo=item["minimo"],
                    unidad=item["unidad"],
                    ubicacion=item["ubicacion"],
                    activo=True,
                )
                session.add(nuevo_rep)
                session.flush()
                rep_obj = nuevo_rep
            else:
                rep_obj = existente

            repuestos_creados.append(
                RepuestoBOMRead(
                    id=rep_obj.id or 0,
                    codigo=rep_obj.codigo,
                    nombre=rep_obj.nombre,
                    minimo_sugerido=rep_obj.minimo,
                    unidad=rep_obj.unidad,
                    ubicacion_sugerida=rep_obj.ubicacion,
                )
            )

        session.commit()

        return MaquinaAltaBOMRead(
            maquina=MaquinaRead.model_validate(maquina, from_attributes=True),
            repuestos_generados=repuestos_creados,
        )




MAQUINAS_INICIALES = [
    {
        "codigo": "SEC-ENV-03",
        "nombre": "Envasadora Rotativa #03",
        "tipo": "Envasadora",
        "sector": "Línea de Envasado A",
        "estado": "Alerta",
        "criticidad": "Crítica",
        "oee": 78.4,
        "temperatura": "68°C",
        "presion": "5.8 bar",
        "horas_operacion": 4820,
        "ultima_revision": "15/10/2026",
        "proximo_mantenimiento": "30/10/2026",
        "responsable": "Carlos Gómez",
    },
    {
        "codigo": "HYD-PRE-12",
        "nombre": "Prensa Hidráulica H-12",
        "tipo": "Prensa",
        "sector": "Prensas y Formado",
        "estado": "En Mantenimiento",
        "criticidad": "Crítica",
        "oee": 62.1,
        "temperatura": "54°C",
        "presion": "140 bar",
        "horas_operacion": 6150,
        "ultima_revision": "20/10/2026",
        "proximo_mantenimiento": "02/11/2026",
        "responsable": "J. Morales",
    },
    {
        "codigo": "CMP-CTR-01",
        "nombre": "Compresor Central C-01",
        "tipo": "Compresor",
        "sector": "Servicios Centrales",
        "estado": "Operativa",
        "criticidad": "Crítica",
        "oee": 94.2,
        "temperatura": "42°C",
        "presion": "8.2 bar",
        "horas_operacion": 12400,
        "ultima_revision": "25/10/2026",
        "proximo_mantenimiento": "25/11/2026",
        "responsable": "M. López",
    },
    {
        "codigo": "BLS-TRN-04",
        "nombre": "Blistera Automática #04",
        "tipo": "Blistera",
        "sector": "Empaque Secundario",
        "estado": "Operativa",
        "criticidad": "Media",
        "oee": 89.6,
        "temperatura": "48°C",
        "presion": "6.0 bar",
        "horas_operacion": 3200,
        "ultima_revision": "18/10/2026",
        "proximo_mantenimiento": "10/11/2026",
        "responsable": "Carlos Gómez",
    },
    {
        "codigo": "LAV-AMP-02",
        "nombre": "Lavadora de Ampollas L-02",
        "tipo": "Lavadora",
        "sector": "Zona Estéril",
        "estado": "Detenida",
        "criticidad": "Crítica",
        "oee": 0.0,
        "temperatura": "22°C",
        "presion": "0.0 bar",
        "horas_operacion": 5100,
        "ultima_revision": "12/10/2026",
        "proximo_mantenimiento": "31/10/2026",
        "responsable": "Sin asignar",
    },
    {
        "codigo": "RCT-SNT-01",
        "nombre": "Reactor de Síntesis R-01",
        "tipo": "Reactor",
        "sector": "Planta Química",
        "estado": "Operativa",
        "criticidad": "Media",
        "oee": 91.0,
        "temperatura": "75°C",
        "presion": "2.4 bar",
        "horas_operacion": 8900,
        "ultima_revision": "22/10/2026",
        "proximo_mantenimiento": "15/11/2026",
        "responsable": "M. López",
    },
]


def seed_maquinas_si_no_existen(session: Session) -> None:
    for datos in MAQUINAS_INICIALES:
        statement = select(Maquina).where(
            Maquina.codigo == datos["codigo"]
        )
        existente = session.exec(statement).first()

        if existente is None:
            session.add(Maquina(**datos))

    session.commit()

