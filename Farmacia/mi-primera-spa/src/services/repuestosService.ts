
import { apiGet, apiPost } from "./api";
import type { Repuesto } from "../data/repuestos";



export async function obtenerRepuestos(): Promise<Repuesto[]> {
  return apiGet<Repuesto[]>("/api/v1/repuestos");
}



export async function obtenerRepuestoPorId(
  id: number
): Promise<Repuesto> {
  return apiGet<Repuesto>(`/api/v1/repuestos/${id}`);
}



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
  maquina?: string | null;
  orden_trabajo?: string | null;
  tecnico?: string | null;

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



// ==========================================
// OBTENER MOVIMIENTOS DE UN REPUESTO
// ==========================================

export async function obtenerMovimientosRepuesto(
  repuestoId: number
): Promise<MovimientoStockAPI[]> {

  return apiGet<MovimientoStockAPI[]>(
    `/api/v1/repuestos/${repuestoId}/movimientos`
  );
}


export interface ConsumoStockCreate {
  cantidad: number;
  maquina: string;
  orden_trabajo: string;
  motivo: string;
  tecnico: string;
}

export interface ConsumoStockResponse {
  movimiento: MovimientoStockAPI;
  stock_anterior: number;
  stock_actual: number;
}

export async function registrarConsumoStock(
  repuestoId: number,
  datos: ConsumoStockCreate
): Promise<ConsumoStockResponse> {
  return apiPost<ConsumoStockResponse, ConsumoStockCreate>(
    `/api/v1/repuestos/${repuestoId}/consumos`,
    datos
  );
}
