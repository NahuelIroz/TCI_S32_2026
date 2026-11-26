
"""Capa de negocio para Incidencias.

Implementa las reglas del CU-01: Reportar incidencia.
"""

from uuid import uuid4

from app.models.incidencia import (
    Incidencia,
    IncidenciaDetalleRead,
    EstadoIncidencia,
    Turno,
    PrioridadIncidencia,
)

from app.models.usuario import RolUsuario
from app.repositories.incidencia_repository import IncidenciaRepository


TRANSICIONES_PERMITIDAS = {
    EstadoIncidencia.REPORTADA: {
        EstadoIncidencia.EN_TRIAGE
    },
    EstadoIncidencia.EN_TRIAGE: {
        EstadoIncidencia.EN_REPARACION,
        EstadoIncidencia.RECHAZADA
    },
    EstadoIncidencia.EN_REPARACION: {
        EstadoIncidencia.RESUELTA
    },
    EstadoIncidencia.RESUELTA: {
        EstadoIncidencia.CERRADA
    },
    EstadoIncidencia.CERRADA: set(),
    EstadoIncidencia.RECHAZADA: set(),
}


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

    def listar_detalladas(
        self,
        estado: EstadoIncidencia | None = None,
        maquina_id: int | None = None,
    ) -> list[IncidenciaDetalleRead]:
        filas = self.repository.listar_con_detalle(
            estado=estado,
            maquina_id=maquina_id,
        )
        resultado: list[IncidenciaDetalleRead] = []
        for inc, maq, usu, fotos_count in filas:
            resultado.append(
                IncidenciaDetalleRead(
                    id=inc.id or 0,
                    codigo=inc.codigo,
                    maquina_id=inc.maquina_id,
                    codigo_maquina=maq.codigo if maq else "N/A",
                    maquina=maq.nombre if maq else "Máquina no encontrada",
                    usuario_reportante_id=inc.usuario_reportante_id,
                    tecnico=usu.nombre if usu else "Sin asignar",
                    descripcion=inc.descripcion,
                    turno=inc.turno,
                    prioridad=inc.prioridad,
                    estado=inc.estado,
                    fecha_reporte=inc.fecha_reporte,
                    adjuntos=fotos_count,
                )
            )
        return resultado


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

        
    def cambiar_estado(
        self,
        incidencia_id: int,
        nuevo_estado: EstadoIncidencia,
    ) -> Incidencia:

        incidencia = self.repository.obtener_por_id(incidencia_id)

        if incidencia is None:
            raise ValueError("La incidencia no existe")

        estado_actual = incidencia.estado

        estados_permitidos = TRANSICIONES_PERMITIDAS.get(
            estado_actual,
            set()
        )

        if nuevo_estado not in estados_permitidos:
            raise ValueError(
                f"No se permite cambiar de "
                f"{estado_actual.value} a {nuevo_estado.value}"
            )

        incidencia.estado = nuevo_estado

        return self.repository.actualizar(incidencia)

