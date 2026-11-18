
import { apiGet, apiPost } from "./api";
import type { Repuesto } from "../data/repuestos";

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

// ==========================================
// INTERFACES PARA INGRESO DE STOCK
// ==========================================

// Datos enviados desde React hacia FastAPI
export interface IngresoStockCreate {
  cantidad: number;
  remito: string;
  ubicacion: string;
  proveedor: string;
  tecnico_delegado: string;
  observaciones: string;
}

// Movimiento registrado en PostgreSQL
export interface MovimientoStockAPI {
  id: number;
  repuesto_id: number;
  tipo: "INGRESO" | "CONSUMO" | "AJUSTE";
  cantidad: number;
  motivo: string;
  fecha: string;
  remito: string | null;
  ubicacion: string | null;
  proveedor: string | null;
  tecnico_delegado: string | null;
  observaciones: string | null;
}

// Respuesta del endpoint de ingreso
export interface IngresoStockResponse {
  movimiento: MovimientoStockAPI;
  stock_anterior: number;
  stock_actual: number;
}

// ==========================================
// REGISTRAR INGRESO DE STOCK
// ==========================================

export async function registrarIngresoStock(
  repuestoId: number,
  datos: IngresoStockCreate
): Promise<IngresoStockResponse> {

  return apiPost<IngresoStockResponse, IngresoStockCreate>(
    `/api/v1/repuestos/${repuestoId}/ingresos`,
    datos
  );
}
