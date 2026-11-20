
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






export async function obtenerRepuestoPorCodigo(
  codigo: string
): Promise<Repuesto> {
  const parametro = encodeURIComponent(codigo.trim());

  return apiGet<Repuesto>(
    `/api/v1/repuestos/codigo/${parametro}`
  );
}



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
  incidencia_id: number | null;

}

// Respuesta del endpoint de ingreso
export interface IngresoStockResponse {
  movimiento: MovimientoStockAPI;
  stock_anterior: number;
  stock_actual: number;
}



export async function registrarIngresoStock(
  repuestoId: number,
  datos: IngresoStockCreate
): Promise<IngresoStockResponse> {

  return apiPost<IngresoStockResponse, IngresoStockCreate>(
    `/api/v1/repuestos/${repuestoId}/ingresos`,
    datos
  );
}





export async function obtenerMovimientosRepuesto(
  repuestoId: number
): Promise<MovimientoStockAPI[]> {

  return apiGet<MovimientoStockAPI[]>(
    `/api/v1/repuestos/${repuestoId}/movimientos`
  );
}


export interface ConsumoStockCreate {
  incidencia_id: number;
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


export interface RepuestoGestion {
  id: number;
  codigo: string;
  nombre: string;
  disponible: number;
  minimo: number;
  unidad: string;
  ubicacion: string;
  estado: string;
  activo: boolean;
}

export interface RepuestoGestionCreate {
  codigo: string;
  nombre: string;
  minimo: number;
  unidad: string;
  ubicacion: string;
}

export type RepuestoGestionUpdate = Partial<RepuestoGestionCreate>;

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function peticionGestion<T>(
  ruta: string,
  metodo: "PATCH" | "POST",
  datos?: unknown
): Promise<T> {
  const token = localStorage.getItem("token");

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(datos !== undefined ? { body: JSON.stringify(datos) } : {}),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    const detalle = error?.detail;

    throw new Error(
      typeof detalle === "string"
        ? detalle
        : `Error HTTP ${respuesta.status}`
    );
  }

  return respuesta.json() as Promise<T>;
}

export function listarRepuestosGestion(): Promise<RepuestoGestion[]> {
  return apiGet<RepuestoGestion[]>(
    "/api/v1/repuestos?incluir_inactivos=true"
  );
}

export function crearRepuesto(
  datos: RepuestoGestionCreate
): Promise<RepuestoGestion> {
  return peticionGestion<RepuestoGestion>(
    "/api/v1/repuestos",
    "POST",
    datos
  );
}

export function editarRepuesto(
  id: number,
  datos: RepuestoGestionUpdate
): Promise<RepuestoGestion> {
  return peticionGestion<RepuestoGestion>(
    `/api/v1/repuestos/${id}`,
    "PATCH",
    datos
  );
}

export function cambiarActivoRepuesto(
  id: number,
  activo: boolean
): Promise<RepuestoGestion> {
  return peticionGestion<RepuestoGestion>(
    `/api/v1/repuestos/${id}/${activo ? "reactivar" : "desactivar"}`,
    "PATCH"
  );
}

