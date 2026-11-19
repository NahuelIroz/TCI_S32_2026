
from sqlmodel import Session, select

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
        statement = select(Maquina).where(Maquina.codigo == datos["codigo"])
        existente = session.exec(statement).first()
        if existente is None:
            maquina = Maquina(**datos)
            session.add(maquina)
        else:
            # Actualizar campos por si la tabla ya existía con el esquema viejo
            for campo, valor in datos.items():
                if campo != "codigo":
                    setattr(existente, campo, valor)
            session.add(existente)
    session.commit()

