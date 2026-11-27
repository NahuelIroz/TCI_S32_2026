from sqlmodel import Session, select

from app.models.maquina import Maquina
from app.models.tarea import EstadoTarea, Tarea, TipoTarea
from app.models.usuario import Usuario


class TareaRepository:

    def __init__(self, session: Session):
        self.session = session

    def listar(
        self,
        tipo: TipoTarea | None = None,
        estado: EstadoTarea | None = None,
        maquina_id: int | None = None,
        tecnico_asignado_id: int | None = None,
    ) -> list[tuple[Tarea, Maquina | None, Usuario | None]]:
        statement = (
            select(Tarea, Maquina, Usuario)
            .join(Maquina, Tarea.maquina_id == Maquina.id, isouter=True)
            .join(
                Usuario,
                Tarea.tecnico_asignado_id == Usuario.id,
                isouter=True
            )
        )

        if tipo is not None:
            statement = statement.where(Tarea.tipo == tipo)

        if estado is not None:
            statement = statement.where(Tarea.estado == estado)

        if maquina_id is not None:
            statement = statement.where(
                Tarea.maquina_id == maquina_id
            )

        if tecnico_asignado_id is not None:
            statement = statement.where(
                Tarea.tecnico_asignado_id == tecnico_asignado_id
            )

        statement = statement.order_by(Tarea.id.desc())

        return list(self.session.exec(statement).all())

    def obtener_por_id(
        self, tarea_id: int
    ) -> tuple[Tarea, Maquina | None, Usuario | None] | None:
        statement = (
            select(Tarea, Maquina, Usuario)
            .join(Maquina, Tarea.maquina_id == Maquina.id, isouter=True)
            .join(Usuario, Tarea.tecnico_asignado_id == Usuario.id, isouter=True)
            .where(Tarea.id == tarea_id)
        )
        return self.session.exec(statement).first()

    def obtener_por_codigo(self, codigo: str) -> Tarea | None:
        statement = select(Tarea).where(Tarea.codigo == codigo)
        return self.session.exec(statement).first()

    def crear(self, tarea: Tarea) -> Tarea:
        try:
            self.session.add(tarea)
            self.session.commit()
            self.session.refresh(tarea)
            return tarea
        except Exception:
            self.session.rollback()
            raise

    def actualizar(self, tarea: Tarea) -> Tarea:
        try:
            self.session.add(tarea)
            self.session.commit()
            self.session.refresh(tarea)
            return tarea
        except Exception:
            self.session.rollback()
            raise
