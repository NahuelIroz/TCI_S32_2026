
"""Capa de persistencia para Incidencias.

Utiliza SQLModel para acceder a PostgreSQL.
No contiene reglas de negocio ni lógica HTTP.
"""

from sqlmodel import Session, select

from app.models.foto_incidencia import FotoIncidencia
from app.models.incidencia import Incidencia, EstadoIncidencia, Turno
from app.models.maquina import Maquina
from app.models.usuario import Usuario


class IncidenciaRepository:

    def __init__(self, session: Session):
        self.session = session

    # -----------------------------------------
    # OBTENER TODAS LAS INCIDENCIAS
    # -----------------------------------------


    def listar(
        self,
        estado: EstadoIncidencia | None = None,
        maquina_id: int | None = None,
        turno: Turno | None = None,
        usuario_id: int | None = None,
    ) -> list[Incidencia]:

        statement = select(Incidencia)

        if estado is not None:
            statement = statement.where(
                Incidencia.estado == estado
            )

        if maquina_id is not None:
            statement = statement.where(
                Incidencia.maquina_id == maquina_id
            )

        if turno is not None:
            statement = statement.where(
                Incidencia.turno == turno
            )

        if usuario_id is not None:
            statement = statement.where(
                Incidencia.usuario_reportante_id == usuario_id
            )

        statement = statement.order_by(
            Incidencia.fecha_reporte.desc()
        )

        return list(self.session.exec(statement).all())

    def listar_con_detalle(
        self,
        estado: EstadoIncidencia | None = None,
        maquina_id: int | None = None,
    ) -> list[tuple[Incidencia, Maquina | None, Usuario | None, int]]:
        statement = (
            select(Incidencia, Maquina, Usuario)
            .join(Maquina, Incidencia.maquina_id == Maquina.id, isouter=True)
            .join(Usuario, Incidencia.usuario_reportante_id == Usuario.id, isouter=True)
        )

        if estado is not None:
            statement = statement.where(Incidencia.estado == estado)

        if maquina_id is not None:
            statement = statement.where(Incidencia.maquina_id == maquina_id)

        statement = statement.order_by(Incidencia.fecha_reporte.desc())
        filas = list(self.session.exec(statement).all())

        resultado = []
        for inc, maq, usu in filas:
            fotos = list(
                self.session.exec(
                    select(FotoIncidencia).where(
                        FotoIncidencia.incidencia_id == inc.id
                    )
                ).all()
            ) if inc.id else []
            resultado.append((inc, maq, usu, len(fotos)))

        return resultado


    # -----------------------------------------
    # OBTENER UNA INCIDENCIA POR ID
    # -----------------------------------------

    def obtener_por_id(
        self,
        incidencia_id: int
    ) -> Incidencia | None:

        return self.session.get(Incidencia, incidencia_id)

    # -----------------------------------------
    # BUSCAR MÁQUINA POR CÓDIGO
    # -----------------------------------------

    def obtener_maquina(
        self,
        codigo: str
    ) -> Maquina | None:

        statement = select(Maquina).where(
            Maquina.codigo == codigo
        )

        return self.session.exec(statement).first()

    # -----------------------------------------
    # BUSCAR USUARIO POR ID
    # -----------------------------------------

    def obtener_usuario(
        self,
        usuario_id: int
    ) -> Usuario | None:

        return self.session.get(Usuario, usuario_id)

    # -----------------------------------------
    # CREAR INCIDENCIA
    # -----------------------------------------


    def crear(self, incidencia: Incidencia) -> Incidencia:
        try:
            self.session.add(incidencia)
            self.session.flush()

            # El ID ya fue asignado por PostgreSQL
            incidencia.codigo = f"INC-{incidencia.id:04d}"

            self.session.add(incidencia)
            self.session.commit()
            self.session.refresh(incidencia)

            return incidencia

        except Exception:
            self.session.rollback()
            raise


    def actualizar(self, incidencia: Incidencia) -> Incidencia:
        try:
            self.session.add(incidencia)
            self.session.commit()
            self.session.refresh(incidencia)

            return incidencia

        except Exception:
            self.session.rollback()
            raise

