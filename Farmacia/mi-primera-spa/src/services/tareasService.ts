import { apiGet, apiPost, apiPatch } from "./api";

// ==========================================
// TIPOS
// ==========================================

export type EstadoTarea =
  | "Pendiente"
  | "En Curso"
  | "Completada"
  | "Demorada";

export type PrioridadTarea =
  | "Alta"
  | "Media"
  | "Baja";

export type TipoTarea =
  | "Preventivo"
  | "Correctivo"
  | "Predictivo";

// ==========================================
// INTERFACES
// ==========================================

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

export interface TecnicoAPI {
  id: number;
  username: string;
  nombre: string;
}

export interface ProgresoTareaDTO {
  progreso: number;
  observaciones?: string | null;
}

// ==========================================
// OBTENER TODAS LAS TAREAS
// ==========================================

export async function obtenerTareas(
  tipo?: TipoTarea,
  estado?: EstadoTarea,
  maquinaId?: number
): Promise<TareaAPI[]> {

  const params = new URLSearchParams();

  if (tipo) params.append("tipo", tipo);
  if (estado) params.append("estado", estado);

  if (maquinaId) {
    params.append("maquina_id", maquinaId.toString());
  }

  const query = params.toString()
    ? `?${params.toString()}`
    : "";

  return apiGet<TareaAPI[]>(
    `/api/v1/tareas${query}`
  );
}

// ==========================================
// OBTENER MIS TAREAS
// ==========================================

export async function obtenerMisTareas(
  estado?: EstadoTarea
): Promise<TareaAPI[]> {

  const params = new URLSearchParams();

  if (estado) {
    params.append("estado", estado);
  }

  const query = params.toString()
    ? `?${params.toString()}`
    : "";

  return apiGet<TareaAPI[]>(
    `/api/v1/tareas/mis-tareas${query}`
  );
}

// ==========================================
// OBTENER DETALLE
// ==========================================

export async function obtenerTareaPorId(
  id: number
): Promise<TareaAPI> {

  return apiGet<TareaAPI>(
    `/api/v1/tareas/${id}`
  );
}

// ==========================================
// OBTENER TÉCNICOS ACTIVOS
// ==========================================

export async function obtenerTecnicos(): Promise<TecnicoAPI[]> {

  return apiGet<TecnicoAPI[]>(
    "/api/v1/tareas/tecnicos"
  );
}

// ==========================================
// CREAR TAREA
// ==========================================

export async function crearTarea(
  datos: TareaCreateDTO
): Promise<TareaAPI> {

  return apiPost<TareaAPI, TareaCreateDTO>(
    "/api/v1/tareas",
    datos
  );
}

// ==========================================
// ACTUALIZAR PROGRESO Y OBSERVACIONES
// ==========================================

export async function actualizarProgresoTarea(
  id: number,
  progreso: number,
  observaciones?: string
): Promise<TareaAPI> {

  return apiPatch<TareaAPI, ProgresoTareaDTO>(
    `/api/v1/tareas/${id}/progreso`,
    {
      progreso,
      observaciones,
    }
  );
}
