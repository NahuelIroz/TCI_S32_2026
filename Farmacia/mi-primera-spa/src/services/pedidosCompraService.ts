
import { apiGet, apiPost } from "./api";

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
