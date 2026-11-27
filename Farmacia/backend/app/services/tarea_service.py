from sqlmodel import Session, select

from app.models.maquina import Maquina
from app.models.tarea import EstadoTarea, PrioridadTarea, Tarea, TareaCreate, TareaRead, TipoTarea
from app.models.usuario import Usuario
from app.repositories.tarea_repository import TareaRepository


class TareaService:

    def __init__(self, repository: TareaRepository):
        self.repository = repository

    def listar(
        self,
        tipo: TipoTarea | None = None,
        estado: EstadoTarea | None = None,
        maquina_id: int | None = None,
        tecnico_asignado_id: int | None = None,
    ) -> list[TareaRead]:
        filas = self.repository.listar(
            tipo=tipo,
            estado=estado,
            maquina_id=maquina_id,
            tecnico_asignado_id=tecnico_asignado_id,
        )
        resultado: list[TareaRead] = []
        for tarea, maq, usu in filas:
            resultado.append(
                TareaRead(
                    id=tarea.id or 0,
                    codigo=tarea.codigo,
                    titulo=tarea.titulo,
                    descripcion=tarea.descripcion,
                    maquina_id=tarea.maquina_id,
                    maquina=maq.nombre if maq else "Máquina no encontrada",
                    codigo_maquina=maq.codigo if maq else "N/A",
                    tecnico_asignado_id=tarea.tecnico_asignado_id,
                    tecnico_asignado=usu.nombre if usu else "Sin asignar",
                    prioridad=tarea.prioridad,
                    tipo=tarea.tipo,
                    estado=tarea.estado,
                    fecha_limite=tarea.fecha_limite,
                    progreso=tarea.progreso,
                    observaciones=tarea.observaciones,
                )
            )
        return resultado

    def obtener_por_id(self, tarea_id: int) -> TareaRead:
        registro = self.repository.obtener_por_id(tarea_id)
        if registro is None:
            raise ValueError("La tarea no existe")
        tarea, maq, usu = registro
        return TareaRead(
            id=tarea.id or 0,
            codigo=tarea.codigo,
            titulo=tarea.titulo,
            descripcion=tarea.descripcion,
            maquina_id=tarea.maquina_id,
            maquina=maq.nombre if maq else "Máquina no encontrada",
            codigo_maquina=maq.codigo if maq else "N/A",
            tecnico_asignado_id=tarea.tecnico_asignado_id,
            tecnico_asignado=usu.nombre if usu else "Sin asignar",
            prioridad=tarea.prioridad,
            tipo=tarea.tipo,
            estado=tarea.estado,
            fecha_limite=tarea.fecha_limite,
            progreso=tarea.progreso,
            observaciones=tarea.observaciones,
        )

    def crear(self, datos: TareaCreate) -> TareaRead:
        tarea = Tarea(
            codigo=datos.codigo,
            titulo=datos.titulo,
            descripcion=datos.descripcion,
            maquina_id=datos.maquina_id,
            tecnico_asignado_id=datos.tecnico_asignado_id,
            prioridad=datos.prioridad,
            tipo=datos.tipo,
            estado=datos.estado,
            fecha_limite=datos.fecha_limite,
            progreso=datos.progreso,
            observaciones=datos.observaciones,
        )
        guardada = self.repository.crear(tarea)
        return self.obtener_por_id(guardada.id or 0)

    def actualizar_progreso(
        self,
        tarea_id: int,
        nuevo_progreso: int,
        observaciones: str | None = None,
    ) -> TareaRead:

        registro = self.repository.obtener_por_id(tarea_id)

        if registro is None:
            raise ValueError("La tarea no existe")

        tarea, _, _ = registro

        tarea.progreso = min(100, max(0, nuevo_progreso))

        if tarea.progreso == 100:
            tarea.estado = EstadoTarea.COMPLETADA

        elif tarea.estado == EstadoTarea.DEMORADA:
            tarea.estado = EstadoTarea.DEMORADA

        elif tarea.progreso > 0:
            tarea.estado = EstadoTarea.EN_CURSO

        else:
            tarea.estado = EstadoTarea.PENDIENTE

        if observaciones is not None:
            tarea.observaciones = observaciones

        self.repository.actualizar(tarea)

        return self.obtener_por_id(tarea_id)


TAREAS_SEMILLA = [
  {
    "codigo": "TAR-2026-081",
    "titulo": "Cambio de rodamientos de cabezal en envasadora",
    "descripcion": "Reemplazo de rodamientos SKF 6204-2RSH por vibración en alta revolución.",
    "maquina_codigo": "SEC-ENV-03",
    "tecnico_username": "mantenimiento",
    "prioridad": PrioridadTarea.ALTA,
    "tipo": TipoTarea.CORRECTIVO,
    "estado": EstadoTarea.EN_CURSO,
    "fecha_limite": "30/10/2026",
    "progreso": 65,
    "observaciones": "Piezas retiradas del depósito bajo reserva RES-2026-001.",
  },
  {
    "codigo": "TAR-2026-082",
    "titulo": "Recalibración de válvula solenoide secundaria",
    "descripcion": "Ajuste de presión neumática y prueba de estanqueidad en prensa hidráulica.",
    "maquina_codigo": "HYD-PRE-12",
    "tecnico_username": "mantenimiento",
    "prioridad": PrioridadTarea.MEDIA,
    "tipo": TipoTarea.PREVENTIVO,
    "estado": EstadoTarea.PENDIENTE,
    "fecha_limite": "02/11/2026",
    "progreso": 10,
    "observaciones": "A la espera de autorización de repuesto solenoide Festo.",
  },
  {
    "codigo": "TAR-2026-083",
    "titulo": "Inspección termográfica de tableros eléctricos",
    "descripcion": "Monitoreo de puntos calientes en subestación de compresores centrales.",
    "maquina_codigo": "CMP-CTR-01",
    "tecnico_username": "mantenimiento",
    "prioridad": PrioridadTarea.BAJA,
    "tipo": TipoTarea.PREDICTIVO,
    "estado": EstadoTarea.COMPLETADA,
    "fecha_limite": "28/10/2026",
    "progreso": 100,
    "observaciones": "Temperatura normal en todos los bornes. Informe adjuntado.",
  },
  {
    "codigo": "TAR-2026-084",
    "titulo": "Limpieza y desinfección de sellos mecánicos",
    "descripcion": "Protocolo GMP de sanitización de sellos mecánicos y sensores en llenadora estéril.",
    "maquina_codigo": "LAV-AMP-02",
    "tecnico_username": None,
    "prioridad": PrioridadTarea.ALTA,
    "tipo": TipoTarea.PREVENTIVO,
    "estado": EstadoTarea.PENDIENTE,
    "fecha_limite": "31/10/2026",
    "progreso": 0,
    "observaciones": "Requiere corte de energía coordinado con producción.",
  },
]


def seed_tareas_si_no_existen(session: Session) -> None:
    for item in TAREAS_SEMILLA:
        existente = session.exec(select(Tarea).where(Tarea.codigo == item["codigo"])).first()
        if existente is not None:
            continue

        maquina = session.exec(select(Maquina).where(Maquina.codigo == item["maquina_codigo"])).first()
        maquina_id = maquina.id if maquina else 1

        tecnico_id = None
        if item["tecnico_username"]:
            tecnico = session.exec(select(Usuario).where(Usuario.username == item["tecnico_username"])).first()
            if tecnico:
                tecnico_id = tecnico.id

        nueva_tarea = Tarea(
            codigo=item["codigo"],
            titulo=item["titulo"],
            descripcion=item["descripcion"],
            maquina_id=maquina_id,
            tecnico_asignado_id=tecnico_id,
            prioridad=item["prioridad"],
            tipo=item["tipo"],
            estado=item["estado"],
            fecha_limite=item["fecha_limite"],
            progreso=item["progreso"],
            observaciones=item["observaciones"],
        )
        session.add(nueva_tarea)

    session.commit()
