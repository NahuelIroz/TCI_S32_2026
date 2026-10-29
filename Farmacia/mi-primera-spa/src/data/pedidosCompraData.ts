export type PrioridadPedido = "Baja" | "Media" | "Urgente";
export type EstadoPedido =
  | "Pendiente de aprobación"
  | "En cotización"
  | "Aprobado"
  | "Rechazado"
  | "Recibido";

export interface PedidoCompraItem {
  id: string;
  codigo: string;
  repuestoNombre: string;
  cantidad: number;
  unidad: string;
  prioridad: PrioridadPedido;
  justificacion: string;
  estado: EstadoPedido;
  fecha: string;
  solicitante: string;
  montoEstimado: number;
  proveedor: string;
  notificacionLeida: boolean;
}

export const pedidosCompraIniciales: PedidoCompraItem[] = [
  {
    id: "PED-2026-012",
    codigo: "SKU-COR-900",
    repuestoNombre: "Correa Dentada Sincrónica 8M",
    cantidad: 5,
    unidad: "unid.",
    prioridad: "Urgente",
    justificacion: "Stock agotado (0 unid.), requerida para compresores principales.",
    estado: "Pendiente de aprobación",
    fecha: "28/10/2026",
    solicitante: "Carlos Gómez (Mantenimiento)",
    montoEstimado: 45000,
    proveedor: "Transmisiones Industriales S.A.",
    notificacionLeida: false,
  },
  {
    id: "PED-2026-011",
    codigo: "SKU-VLV-420",
    repuestoNombre: "Válvula Solenoide Festo 24V DC 5/2",
    cantidad: 10,
    unidad: "unid.",
    prioridad: "Media",
    justificacion: "Stock crítico (2 unid. restantes sobre mínimo de 5).",
    estado: "En cotización",
    fecha: "26/10/2026",
    solicitante: "Carlos Gómez (Mantenimiento)",
    montoEstimado: 185000,
    proveedor: "Festo Neumática Argentina",
    notificacionLeida: false,
  },
  {
    id: "PED-2026-010",
    codigo: "SKU-6204-2R",
    repuestoNombre: "Rodamiento Rígido de Bolas SKF 6204-2RSH",
    cantidad: 20,
    unidad: "unid.",
    prioridad: "Media",
    justificacion: "Reposición periódica para mantenimiento preventivo anual.",
    estado: "Aprobado",
    fecha: "20/10/2026",
    solicitante: "Ing. Martín Bianchi (Encargado)",
    montoEstimado: 120000,
    proveedor: "Rodamientos del Plata SRL",
    notificacionLeida: true,
  },
  {
    id: "PED-2026-009",
    codigo: "SKU-FLT-880",
    repuestoNombre: "Filtro de Aire Compresor Atlas Copco",
    cantidad: 8,
    unidad: "unid.",
    prioridad: "Baja",
    justificacion: "Reposición de stock para segundo semestre.",
    estado: "Recibido",
    fecha: "15/10/2026",
    solicitante: "Ing. Martín Bianchi (Encargado)",
    montoEstimado: 96000,
    proveedor: "Aire Comprimido Tech",
    notificacionLeida: true,
  },
];

