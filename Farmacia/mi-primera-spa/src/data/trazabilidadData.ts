/**
 * RN-06 — Trazabilidad.
 * De cada repuesto se reconstruye su historia interna:
 * pedido de compra → recepción (RN-08) → uso.
 */

export type TipoHitoTrazabilidad = "compra" | "recepcion" | "uso" | "reserva";

export interface HitoTrazabilidad {
  id: string;
  repuestoCodigo: string;
  repuestoNombre: string;
  tipo: TipoHitoTrazabilidad;
  titulo: string;
  fecha: string;
  referencia: string;
  cantidad: number;
  unidad: string;
  usuario: string;
  detalles: string;
  ubicacion?: string;
  maquina?: string;
}

export const trazabilidadInicial: HitoTrazabilidad[] = [
  // Ciclo SKU-6204-2R (Rodamiento SKF)
  {
    id: "TRZ-001",
    repuestoCodigo: "SKU-6204-2R",
    repuestoNombre: "Rodamiento Rígido de Bolas SKF 6204-2RSH",
    tipo: "compra",
    titulo: "1. Solicitud de Pedido de Compra",
    fecha: "20/10/2026 09:30",
    referencia: "PED-2026-010",
    cantidad: 20,
    unidad: "unid.",
    usuario: "Ing. Martín Bianchi (Encargado)",
    detalles: "Pedido emitido con prioridad Media para preventivo anual.",
  },
  {
    id: "TRZ-002",
    repuestoCodigo: "SKU-6204-2R",
    repuestoNombre: "Rodamiento Rígido de Bolas SKF 6204-2RSH",
    tipo: "recepcion",
    titulo: "2. Recepción y Carga en Almacén (RN-08)",
    fecha: "24/10/2026 11:15",
    referencia: "REM-2026-0038",
    cantidad: 20,
    unidad: "unid.",
    usuario: "Carlos Gómez (Mantenimiento)",
    detalles: "Ingreso verificado bajo remito, cargado al stock físico.",
    ubicacion: "Pasillo A · Estante 2 (Nivel 1)",
  },
  {
    id: "TRZ-003",
    repuestoCodigo: "SKU-6204-2R",
    repuestoNombre: "Rodamiento Rígido de Bolas SKF 6204-2RSH",
    tipo: "reserva",
    titulo: "3. Retención para Preventivo (RN-05)",
    fecha: "26/10/2026 14:00",
    referencia: "RES-2026-001",
    cantidad: 4,
    unidad: "unid.",
    usuario: "Ing. Martín Bianchi",
    detalles: "Reserva activa para parada programada en cabezal rotativo.",
    maquina: "Envasadora Rotativa #03",
  },
  {
    id: "TRZ-004",
    repuestoCodigo: "SKU-6204-2R",
    repuestoNombre: "Rodamiento Rígido de Bolas SKF 6204-2RSH",
    tipo: "uso",
    titulo: "4. Consumo en Reparación (RN-01)",
    fecha: "28/10/2026 16:45",
    referencia: "OT-2026-079",
    cantidad: 2,
    unidad: "unid.",
    usuario: "Carlos Gómez (Mantenimiento)",
    detalles: "Reemplazo de rodamientos desgastados por vibración.",
    maquina: "Blistera Automática #04",
  },

  // Ciclo SKU-FLT-880 (Filtro Atlas Copco)
  {
    id: "TRZ-005",
    repuestoCodigo: "SKU-FLT-880",
    repuestoNombre: "Filtro de Aire Compresor Atlas Copco",
    tipo: "compra",
    titulo: "1. Solicitud de Pedido de Compra",
    fecha: "15/10/2026 10:00",
    referencia: "PED-2026-009",
    cantidad: 8,
    unidad: "unid.",
    usuario: "Ing. Martín Bianchi",
    detalles: "Pedido preventivo para segundo semestre.",
  },
  {
    id: "TRZ-006",
    repuestoCodigo: "SKU-FLT-880",
    repuestoNombre: "Filtro de Aire Compresor Atlas Copco",
    tipo: "recepcion",
    titulo: "2. Recepción y Carga en Almacén (RN-08)",
    fecha: "18/10/2026 14:20",
    referencia: "REM-2026-0029",
    cantidad: 8,
    unidad: "unid.",
    usuario: "Carlos Gómez",
    detalles: "Control de calidad y almacenamiento físico en depósito.",
    ubicacion: "Pasillo A · Estante 1 (Nivel 2)",
  },
  {
    id: "TRZ-007",
    repuestoCodigo: "SKU-FLT-880",
    repuestoNombre: "Filtro de Aire Compresor Atlas Copco",
    tipo: "uso",
    titulo: "3. Consumo en Mantenimiento Preventivo (RN-10)",
    fecha: "25/10/2026 18:20",
    referencia: "OT-2026-083",
    cantidad: 3,
    unidad: "unid.",
    usuario: "M. López",
    detalles: "Sustitución periódica de filtros y purga automática realizada.",
    maquina: "Compresor Central C-01",
  },
];

