import { apiGet } from "./api";

export interface ResumenMaquinas {
  total: number;
  operativas: number;
  en_alerta: number;
  en_mantenimiento: number;
  detenidas: number;
  oee_promedio: number;
}

export interface IncidenciaTablero {
  id: number;
  codigo: string;
  maquina_id: number;
  maquina_codigo: string;
  maquina_nombre: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  fecha_reporte: string;
  turno: string;
  tecnico: string;
}

export interface TableroResumen {
  maquinas: ResumenMaquinas;
  incidencias_activas: number;
  incidencias: IncidenciaTablero[];
}

export async function obtenerTableroResumen(): Promise<TableroResumen> {
  return apiGet<TableroResumen>("/api/v1/tablero/resumen");
}
