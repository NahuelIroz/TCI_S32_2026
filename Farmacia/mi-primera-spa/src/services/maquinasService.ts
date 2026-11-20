
import { apiGet } from "./api";

export interface MaquinaAPI {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  sector: string;
  estado: string;
}

export async function obtenerMaquinas(): Promise<MaquinaAPI[]> {
  return apiGet<MaquinaAPI[]>("/api/v1/maquinas");
}

export async function obtenerMaquinaPorId(
  id: number
): Promise<MaquinaAPI> {
  return apiGet<MaquinaAPI>(`/api/v1/maquinas/${id}`);
}

import { apiPost } from "./api";

export interface MaquinaGestion extends MaquinaAPI {
  activo: boolean;
  criticidad: string;
  oee: number;
  temperatura: string;
  presion: string;
  horas_operacion: number;
  ultima_revision: string;
  proximo_mantenimiento: string;
  responsable: string;
}

export type MaquinaGestionCreate = Omit<
  MaquinaGestion,
  "id" | "activo"
>;

export async function listarMaquinasGestion(): Promise<MaquinaGestion[]> {
  return apiGet<MaquinaGestion[]>(
    "/api/v1/maquinas?incluir_inactivas=true"
  );
}

export async function crearMaquina(
  datos: MaquinaGestionCreate
): Promise<MaquinaGestion> {
  return apiPost<MaquinaGestion, MaquinaGestionCreate>(
    "/api/v1/maquinas",
    datos
  );
}

export async function editarMaquina(
  id: number,
  datos: MaquinaGestionCreate
): Promise<MaquinaGestion> {
  const API_URL =
    import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  const respuesta = await fetch(`${API_URL}/api/v1/maquinas/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.detail ?? "No se pudo editar la máquina");
  }

  return respuesta.json();
}

export async function cambiarActivoMaquina(
  id: number,
  activo: boolean
): Promise<MaquinaGestion> {
  const API_URL =
    import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  const respuesta = await fetch(
    `${API_URL}/api/v1/maquinas/${id}/activo`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo }),
    }
  );

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.detail ?? "No se pudo cambiar el estado");
  }

  return respuesta.json();
}
