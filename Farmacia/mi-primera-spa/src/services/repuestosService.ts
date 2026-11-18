
import { apiGet } from "./api";

import type {
  Repuesto,
} from "../data/repuestos";

// ==========================================
// OBTENER TODOS LOS REPUESTOS
// ==========================================

export async function obtenerRepuestos(): Promise<Repuesto[]> {
  return apiGet<Repuesto[]>("/api/v1/repuestos");
}

// ==========================================
// OBTENER REPUESTO POR ID
// ==========================================

export async function obtenerRepuestoPorId(
  id: number
): Promise<Repuesto> {
  return apiGet<Repuesto>(`/api/v1/repuestos/${id}`);
}

// ==========================================
// BUSCAR REPUESTOS EN EL BACKEND
// ==========================================

export async function buscarRepuestos(
  texto: string
): Promise<Repuesto[]> {
  const parametro = encodeURIComponent(texto);

  return apiGet<Repuesto[]>(
    `/api/v1/repuestos?buscar=${parametro}`
  );
}
