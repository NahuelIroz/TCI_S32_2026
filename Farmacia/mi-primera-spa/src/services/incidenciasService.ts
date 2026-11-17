
import { apiGet } from "./api";

// Estados definidos en nuestro M1
export type EstadoIncidenciaAPI =
  | "REPORTADA"
  | "EN_TRIAGE"
  | "EN_REPARACION"
  | "RESUELTA"
  | "CERRADA"
  | "RECHAZADA";

export interface IncidenciaAPI {
  id: number;
  codigo: string;
  maquina_id: number;
  usuario_reportante_id: number;
  descripcion: string;
  turno: "Mañana" | "Tarde" | "Noche";
  prioridad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  estado: EstadoIncidenciaAPI;
  fecha_reporte: string;
}

// GET /api/v1/incidencias
export async function obtenerIncidencias(): Promise<IncidenciaAPI[]> {
  return apiGet<IncidenciaAPI[]>("/api/v1/incidencias");
}
