"""Capa de lógica de negocio para el Tablero de Seguimiento (Gerencia)."""

from app.models.tablero import IncidenciaTablero, ResumenMaquinas, TableroResumen
from app.repositories.tablero_repository import TableroRepository


class TableroService:

    def __init__(self, repository: TableroRepository):
        self.repository = repository

    def obtener_resumen(self) -> TableroResumen:
        maquinas = self.repository.obtener_maquinas()

        total = len(maquinas)
        operativas = 0
        en_alerta = 0
        en_mantenimiento = 0
        detenidas = 0
        suma_oee = 0.0

        for m in maquinas:
            estado_norm = m.estado.strip().upper()
            if estado_norm in ("OPERATIVA", "OPERATIVO"):
                operativas += 1
            elif estado_norm in ("ALERTA", "EN ALERTA"):
                en_alerta += 1
            elif estado_norm in ("MANTENIMIENTO", "EN MANTENIMIENTO"):
                en_mantenimiento += 1
            elif estado_norm in ("DETENIDA", "DETENIDO"):
                detenidas += 1
            else:
                operativas += 1

            suma_oee += getattr(m, "oee", 0.0) or 0.0

        oee_promedio = round(suma_oee / total, 1) if total > 0 else 0.0

        resumen_maquinas = ResumenMaquinas(
            total=total,
            operativas=operativas,
            en_alerta=en_alerta,
            en_mantenimiento=en_mantenimiento,
            detenidas=detenidas,
            oee_promedio=oee_promedio,
        )

        filas_incidencias = self.repository.obtener_incidencias_activas()

        incidencias_tablero: list[IncidenciaTablero] = []
        for inc, maq, usu in filas_incidencias:
            incidencias_tablero.append(
                IncidenciaTablero(
                    id=inc.id or 0,
                    codigo=inc.codigo,
                    maquina_id=inc.maquina_id,
                    maquina_codigo=maq.codigo if maq else "N/A",
                    maquina_nombre=maq.nombre if maq else "Máquina no encontrada",
                    descripcion=inc.descripcion,
                    estado=inc.estado.value if hasattr(inc.estado, "value") else str(inc.estado),
                    prioridad=inc.prioridad.value if hasattr(inc.prioridad, "value") else str(inc.prioridad),
                    fecha_reporte=inc.fecha_reporte,
                    turno=inc.turno.value if hasattr(inc.turno, "value") else str(inc.turno),
                    tecnico=usu.nombre if usu else "Sin asignar",
                )
            )

        return TableroResumen(
            maquinas=resumen_maquinas,
            incidencias_activas=len(incidencias_tablero),
            incidencias=incidencias_tablero,
        )
