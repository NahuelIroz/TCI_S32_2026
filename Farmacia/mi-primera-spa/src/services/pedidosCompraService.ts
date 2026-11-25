
import { apiGet, apiPost } from "./api";

import type {
  IngresoStockCreate,
  IngresoStockResponse,
} from "./repuestosService";

export type PrioridadPedido = "Baja" | "Media" | "Urgente";

export type EstadoPedido =
  | "Pendiente de aprobación"
  | "En cotización"
  | "Aprobado"
  | "Rechazado"
  | "Recibido";

export interface PedidoCompraAPI {
  id: number;
  codigo_pedido: string;
  repuesto_id: number;
  codigo: string;
  repuesto_nombre: string;
  unidad: string;
  cantidad: number;
  prioridad: PrioridadPedido;
  justificacion: string;
  estado: EstadoPedido;
  fecha: string;
  solicitante: string;
  monto_estimado: number;
  proveedor: string;
  notificacion_leida: boolean;
}

export interface PedidoCompraCreate {
  repuesto_id: number;
  cantidad: number;
  prioridad: PrioridadPedido;
  justificacion: string;
  solicitante: string;
  monto_estimado: number;
  proveedor: string;
}

export async function obtenerPedidosCompra(): Promise<PedidoCompraAPI[]> {
  return apiGet<PedidoCompraAPI[]>("/api/v1/pedidos-compra");
}

export async function obtenerPedidoCompraPorId(
  id: number
): Promise<PedidoCompraAPI> {
  return apiGet<PedidoCompraAPI>(`/api/v1/pedidos-compra/${id}`);
}

export async function crearPedidoCompra(
  datos: PedidoCompraCreate
): Promise<PedidoCompraAPI> {
  return apiPost<PedidoCompraAPI, PedidoCompraCreate>(
    "/api/v1/pedidos-compra",
    datos
  );
}

// Actualizar estado de un pedido
export async function actualizarEstadoPedido(
  pedidoId: number,
  estado: EstadoPedido
): Promise<PedidoCompraAPI> {
  const baseUrl =
    import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  const response = await fetch(
    `${baseUrl}/api/v1/pedidos-compra/${pedidoId}/estado`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail ?? "No se pudo actualizar el pedido"
    );
  }

  return response.json() as Promise<PedidoCompraAPI>;
}


export interface CotizacionPedidoUpdate {
  proveedor: string;
  monto_estimado: number;
}

export async function actualizarCotizacionPedido(
  pedidoId: number,
  datos: CotizacionPedidoUpdate
): Promise<PedidoCompraAPI> {
  const baseUrl =
    import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  const response = await fetch(
    `${baseUrl}/api/v1/pedidos-compra/${pedidoId}/cotizacion`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      typeof error?.detail === "string"
        ? error.detail
        : "No se pudo registrar la cotización."
    );
  }

  return response.json() as Promise<PedidoCompraAPI>;
}



export interface RecepcionCompraResponse
  extends IngresoStockResponse {
  pedido_compra_id: number;
  cantidad_solicitada: number;
  cantidad_recibida_acumulada: number;
  cantidad_pendiente: number;
  estado_pedido: EstadoPedido;
}

export async function registrarRecepcionCompra(
  pedidoId: number,
  datos: IngresoStockCreate
): Promise<RecepcionCompraResponse> {
  const baseUrl =
    import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  const response = await fetch(
    `${baseUrl}/api/v1/repuestos/pedidos-compra/${pedidoId}/recepciones`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      typeof error?.detail === "string"
        ? error.detail
        : "No se pudo registrar la recepción."
    );
  }

  return response.json() as Promise<RecepcionCompraResponse>;
}


export interface RecepcionCompraAPI {
  id: number;
  pedido_compra_id: number | null;
  repuesto_id: number;
  tipo: string;
  cantidad: number;
  motivo: string;
  fecha: string;
  remito: string | null;
  ubicacion: string | null;
  proveedor: string | null;
  tecnico_delegado: string | null;
  observaciones: string | null;
}

export async function obtenerRecepcionesCompra(
  pedidoId: number
): Promise<RecepcionCompraAPI[]> {
  return apiGet<RecepcionCompraAPI[]>(
    `/api/v1/repuestos/pedidos-compra/${pedidoId}/recepciones`
  );
}

export async function decisionGerenciaPedido(
  pedidoId: number,
  estado: "Aprobado" | "Rechazado"
): Promise<PedidoCompraAPI> {
  const baseUrl =
    import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  const response = await fetch(
    `${baseUrl}/api/v1/pedidos-compra/${pedidoId}/decision-gerencia`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      typeof error?.detail === "string"
        ? error.detail
        : "No se pudo procesar la decisión de Gerencia."
    );
  }

  return response.json() as Promise<PedidoCompraAPI>;
}

export async function aprobarTodosPendientesGerencia(): Promise<PedidoCompraAPI[]> {
  return apiPost<PedidoCompraAPI[], Record<string, never>>(
    "/api/v1/pedidos-compra/aprobar-pendientes",
    {}
  );
}

export async function marcarNotificacionPedidoLeida(
  pedidoId: number,
  notificacion_leida = true
): Promise<PedidoCompraAPI> {
  const baseUrl =
    import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  const response = await fetch(
    `${baseUrl}/api/v1/pedidos-compra/${pedidoId}/notificacion-leida`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificacion_leida }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      typeof error?.detail === "string"
        ? error.detail
        : "No se pudo actualizar la notificación."
    );
  }

  return response.json() as Promise<PedidoCompraAPI>;
}

export async function marcarTodasNotificacionesPedidosLeidas(): Promise<PedidoCompraAPI[]> {
  return apiPost<PedidoCompraAPI[], Record<string, never>>(
    "/api/v1/pedidos-compra/marcar-todas-leidas",
    {}
  );
}



