from sqlmodel import SQLModel


class MetricasConfiabilidad(SQLModel):
    mtbf_horas: float
    mttr_horas: float
    tasa_averias_porcentaje: float
    disponibilidad_planta: float


class TendenciaMensual(SQLModel):
    mes: str
    fallas: int
    horas_parada: float


class RankingRepuesto(SQLModel):
    id: int
    sku: str
    nombre: str
    usos: int
    costo_acumulado: float
    consumo_promedio_mensual: float


class CostoPorSector(SQLModel):
    sector: str
    porcentaje: int
    monto: float


class EstadisticasHistoricosRead(SQLModel):
    metricas: MetricasConfiabilidad
    tendencia_semestral: list[TendenciaMensual]
    ranking_repuestos: list[RankingRepuesto]
    costos_por_sector: list[CostoPorSector]
