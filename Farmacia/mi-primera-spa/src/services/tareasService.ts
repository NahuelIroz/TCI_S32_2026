import { apiGet, apiPost } from "./api";

export type EstadoTarea = "Pendiente" | "En Curso" | "Completada" | "Demorada";
export type PrioridadTarea = "Alta" | "Media" | "Baja";
export type TipoTarea = "Preventivo" | "Correctivo" | "Predictivo";

export interface TareaAPI {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  maquina_id: number;
  maquina: string;
  codigo_maquina: string;
  tecnico_asignado_id: number | null;
  tecnico_asignado: string;
  prioridad: PrioridadTarea;
  tipo: TipoTarea;
  estado: EstadoTarea;
  fecha_limite: string;
  progreso: number;
  observaciones: string | null;
}

export async function obtenerTareas(
  tipo?: TipoTarea,
  estado?: EstadoTarea,
  maquinaId?: number
): Promise<TareaAPI[]> {
  const params = new URLSearchParams();
  if (tipo) params.append("tipo", tipo);
  if (estado) params.append("estado", estado);
  if (maquinaId) params.append("maquina_id", maquinaId.toString());
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<TareaAPI[]>(`/api/v1/tareas${query}`);
}

export interface TareaCreateDTO {
  codigo: string;
  titulo: string;
  descripcion: string;
  maquina_id: number;
  tecnico_asignado_id?: number | null;
  prioridad?: PrioridadTarea;
  tipo?: TipoTarea;
  estado?: EstadoTarea;
  fecha_limite?: string;
  progreso?: number;
  observaciones?: string | null;
}

export async function crearTarea(datos: TareaCreateDTO): Promise<TareaAPI> {
  return apiPost<TareaAPI, TareaCreateDTO>("/api/v1/tareas", datos);
}
