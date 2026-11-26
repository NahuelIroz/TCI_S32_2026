from app.models.estadistica import (
    CostoPorSector,
    EstadisticasHistoricosRead,
    MetricasConfiabilidad,
    RankingRepuesto,
    TendenciaMensual,
)
from app.repositories.estadistica_repository import EstadisticaRepository


HISTORICO_BASE_MESES = [
    {"mes": "Mayo", "fallas": 12, "horas_parada": 18.0},
    {"mes": "Junio", "fallas": 9, "horas_parada": 14.0},
    {"mes": "Julio", "fallas": 15, "horas_parada": 22.0},
    {"mes": "Agosto", "fallas": 8, "horas_parada": 11.0},
    {"mes": "Septiembre", "fallas": 6, "horas_parada": 9.0},
    {"mes": "Octubre", "fallas": 4, "horas_parada": 5.0},
]

BASE_USOS_REPUESTOS = {
    "SKU-6204-2R": {"usos": 34, "costo": 204000.0},
    "SKU-VLV-420": {"usos": 18, "costo": 333000.0},
    "SKU-FLT-880": {"usos": 12, "costo": 144000.0},
    "SKU-COR-900": {"usos": 8, "costo": 72000.0},
}

COSTOS_SECTOR_BASE = [
    {"sector": "Línea de Envasado", "monto": 316000.0},
    {"sector": "Prensas y Formado", "monto": 210000.0},
    {"sector": "Servicios Centrales", "monto": 135000.0},
    {"sector": "Empaque Secundario", "monto": 92000.0},
]


class EstadisticaService:

    def __init__(self, repository: EstadisticaRepository):
        self.repository = repository

    def obtener_historicos(self) -> EstadisticasHistoricosRead:
        maquinas = self.repository.obtener_maquinas()
        incidencias = self.repository.obtener_incidencias()
        repuestos = self.repository.obtener_repuestos()
        consumos = self.repository.obtener_consumos_stock()
        pedidos = self.repository.obtener_pedidos_compra()

        total_horas_operacion = sum(m.horas_operacion for m in maquinas) or 40570
        total_fallas_semestre = sum(m["fallas"] for m in HISTORICO_BASE_MESES) + len(incidencias)
        total_horas_parada = sum(m["horas_parada"] for m in HISTORICO_BASE_MESES) + (len(incidencias) * 1.5)

        mtbf = round(total_horas_operacion / max(1, total_fallas_semestre), 1)
        mttr = round(total_horas_parada / max(1, total_fallas_semestre), 2)
        tasa_averias = round((total_horas_parada / max(1.0, float(total_horas_operacion))) * 100.0, 2)
        oee_prom = (
            round(sum(m.oee for m in maquinas) / len(maquinas), 1)
            if maquinas
            else 85.0
        )

        metricas = MetricasConfiabilidad(
            mtbf_horas=mtbf,
            mttr_horas=mttr,
            tasa_averias_porcentaje=tasa_averias,
            disponibilidad_planta=oee_prom,
        )

        tendencia: list[TendenciaMensual] = []
        for idx, item in enumerate(HISTORICO_BASE_MESES):
            extra_fallas = len(incidencias) if idx == len(HISTORICO_BASE_MESES) - 1 else 0
            extra_horas = round(extra_fallas * 1.5, 1)
            tendencia.append(
                TendenciaMensual(
                    mes=item["mes"],
                    fallas=item["fallas"] + extra_fallas,
                    horas_parada=item["horas_parada"] + extra_horas,
                )
            )

        consumos_por_repuesto: dict[int, int] = {}
        for mov in consumos:
            consumos_por_repuesto[mov.repuesto_id] = (
                consumos_por_repuesto.get(mov.repuesto_id, 0) + mov.cantidad
            )

        costos_pedidos_por_repuesto: dict[int, float] = {}
        for ped in pedidos:
            if ped.monto_estimado > 0:
                costos_pedidos_por_repuesto[ped.repuesto_id] = (
                    costos_pedidos_por_repuesto.get(ped.repuesto_id, 0.0) + ped.monto_estimado
                )

        ranking: list[RankingRepuesto] = []
        for rep in repuestos:
            rep_id = rep.id or 0
            base = BASE_USOS_REPUESTOS.get(rep.codigo, {"usos": 0, "costo": 0.0})
            usos_totales = int(base["usos"]) + consumos_por_repuesto.get(rep_id, 0)
            costo_total = float(base["costo"]) + costos_pedidos_por_repuesto.get(rep_id, 0.0)
            if usos_totales > 0 or costo_total > 0:
                ranking.append(
                    RankingRepuesto(
                        id=rep_id,
                        sku=rep.codigo,
                        nombre=rep.nombre,
                        usos=usos_totales,
                        costo_acumulado=round(costo_total, 2),
                        consumo_promedio_mensual=round(usos_totales / 6.0, 1),
                    )
                )

        ranking.sort(key=lambda r: r.usos, reverse=True)

        total_monto_sectores = sum(s["monto"] for s in COSTOS_SECTOR_BASE) or 1.0
        costos_sector: list[CostoPorSector] = [
            CostoPorSector(
                sector=s["sector"],
                monto=s["monto"],
                porcentaje=round((s["monto"] / total_monto_sectores) * 100),
            )
            for s in COSTOS_SECTOR_BASE
        ]

        return EstadisticasHistoricosRead(
            metricas=metricas,
            tendencia_semestral=tendencia,
            ranking_repuestos=ranking,
            costos_por_sector=costos_sector,
        )
