
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
