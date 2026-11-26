import { apiGet } from "./api";

export interface MetricasConfiabilidad {
  mtbf_horas: number;
  mttr_horas: number;
  tasa_averias_porcentaje: number;
  disponibilidad_planta: number;
}

export interface TendenciaMensual {
  mes: string;
  fallas: number;
  horas_parada: number;
}

export interface RankingRepuesto {
  id: number;
  sku: string;
  nombre: string;
  usos: number;
  costo_acumulado: number;
  consumo_promedio_mensual: number;
}

export interface CostoPorSector {
  sector: string;
  porcentaje: number;
  monto: number;
}

export interface EstadisticasHistoricosRead {
  metricas: MetricasConfiabilidad;
  tendencia_semestral: TendenciaMensual[];
  ranking_repuestos: RankingRepuesto[];
  costos_por_sector: CostoPorSector[];
}

export async function obtenerEstadisticasHistoricos(): Promise<EstadisticasHistoricosRead> {
  return apiGet<EstadisticasHistoricosRead>("/api/v1/estadisticas/historicos");
}
