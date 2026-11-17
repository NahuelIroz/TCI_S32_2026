
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
