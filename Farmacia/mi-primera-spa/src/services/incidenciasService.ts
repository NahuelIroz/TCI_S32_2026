
import { apiGet, apiPost } from "./api";

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



export interface CrearIncidenciaDTO {
  maquina_codigo: string;
  usuario_id: number;
  descripcion: string;
  turno: "Mañana" | "Tarde" | "Noche";
  prioridad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
}

export async function crearIncidencia(
  datos: CrearIncidenciaDTO
): Promise<IncidenciaAPI> {
  return apiPost<IncidenciaAPI, CrearIncidenciaDTO>(
    "/api/v1/incidencias",
    datos
  );
}


export async function obtenerIncidenciaPorId(
  id: number
): Promise<IncidenciaAPI> {
  return apiGet<IncidenciaAPI>(`/api/v1/incidencias/${id}`);
}



export async function cambiarEstadoIncidencia(
  id: number,
  nuevoEstado: EstadoIncidenciaAPI
): Promise<IncidenciaAPI> {
  const API_URL =
    import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  const respuesta = await fetch(
    `${API_URL}/api/v1/incidencias/${id}/estado`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        estado: nuevoEstado,
      }),
    }
  );

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);

    throw new Error(
      typeof error?.detail === "string"
        ? error.detail
        : `Error HTTP ${respuesta.status}`
    );
  }

  return respuesta.json() as Promise<IncidenciaAPI>;
}

