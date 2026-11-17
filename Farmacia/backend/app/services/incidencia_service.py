
"""Capa de negocio para Incidencias.

Implementa las reglas del CU-01: Reportar incidencia.
"""

from uuid import uuid4

from app.models.incidencia import (
    Incidencia,
    EstadoIncidencia,
    Turno,
    PrioridadIncidencia,
)

from app.models.usuario import RolUsuario
from app.repositories.incidencia_repository import IncidenciaRepository


class IncidenciaService:

    def __init__(self, repository: IncidenciaRepository):
        self.repository = repository

    # -----------------------------------------
    # LISTAR INCIDENCIAS
    # -----------------------------------------

    
    def listar(
        self,
        estado: EstadoIncidencia | None = None,
        maquina_id: int | None = None,
        turno: Turno | None = None,
        usuario_id: int | None = None,
    ) -> list[Incidencia]:

        return self.repository.listar(
            estado=estado,
            maquina_id=maquina_id,
            turno=turno,
            usuario_id=usuario_id,
        )


    # -----------------------------------------
    # OBTENER INCIDENCIA
    # -----------------------------------------

    def obtener_por_id(self, incidencia_id: int) -> Incidencia:
        incidencia = self.repository.obtener_por_id(incidencia_id)

        if incidencia is None:
            raise ValueError("La incidencia no existe")

        return incidencia

    # -----------------------------------------
    # REPORTAR INCIDENCIA (CU-01)
    # -----------------------------------------

    def reportar(
        self,
        maquina_codigo: str,
        usuario_id: int,
        descripcion: str,
        turno: Turno,
        prioridad: PrioridadIncidencia = PrioridadIncidencia.MEDIA,
    ) -> Incidencia:

        # 1. Verificar que la máquina exista
        maquina = self.repository.obtener_maquina(maquina_codigo)

        if maquina is None:
            raise ValueError(
                f"No existe una máquina con código {maquina_codigo}"
            )

        # 2. Verificar que el usuario exista
        usuario = self.repository.obtener_usuario(usuario_id)

        if usuario is None:
            raise ValueError("El usuario no existe")

        # 3. Verificar que el usuario esté activo
        if not usuario.activo:
            raise ValueError("El usuario está desactivado")

        # 4. Verificar el rol
        if usuario.rol != RolUsuario.OPERARIO:
            raise PermissionError(
                "Solo los operarios pueden reportar incidencias"
            )

        # 5. Validar descripción
        descripcion = descripcion.strip()

        if not descripcion:
            raise ValueError(
                "La descripción de la incidencia es obligatoria"
            )

        # 6. Crear incidencia con estado inicial REPORTADA
        incidencia = Incidencia(
            codigo=f"TMP-{uuid4().hex}",
            maquina_id=maquina.id,
            usuario_reportante_id=usuario.id,
            descripcion=descripcion,
            turno=turno,
            prioridad=prioridad,
            estado=EstadoIncidencia.REPORTADA,
        )

        # 7. Persistir incidencia
        return self.repository.crear(incidencia)
