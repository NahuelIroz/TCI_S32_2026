export type EstadoReserva = "Activa" | "Liberada" | "Consumida";

export interface ReservaRepuesto {
  id: number;
  codigo: string;
  repuestoCodigo: string;
  repuestoNombre: string;
  cantidad: number;
  unidad: string;
  maquina: string;
  fechaProgramada: string;
  motivo: string;
  solicitante: string;
  estado: EstadoReserva;
  motivoLiberacion?: string;
  fechaLiberacion?: string;
}

export const reservasIniciales: ReservaRepuesto[] = [
  {
    id: 1,
    codigo: "RES-2026-001",
    repuestoCodigo: "SKU-6204-2R",
    repuestoNombre: "Rodamiento Rígido de Bolas SKF 6204-2RSH",
    cantidad: 4,
    unidad: "unid.",
    maquina: "Envasadora Rotativa #03",
    fechaProgramada: "30/10/2026",
    motivo: "Mantenimiento preventivo semestral de cabezal rotativo",
    solicitante: "Ing. Martín Bianchi",
    estado: "Activa",
  },
  {
    id: 2,
    codigo: "RES-2026-002",
    repuestoCodigo: "SKU-VLV-420",
    repuestoNombre: "Válvula Solenoide Festo 24V DC 5/2",
    cantidad: 2,
    unidad: "unid.",
    maquina: "Prensa Hidráulica H-12",
    fechaProgramada: "02/11/2026",
    motivo: "Revisión programada de circuito neumático",
    solicitante: "Ing. Martín Bianchi",
    estado: "Activa",
  },
  {
    id: 3,
    codigo: "RES-2026-003",
    repuestoCodigo: "SKU-FLT-880",
    repuestoNombre: "Filtro de Aire Compresor Atlas Copco",
    cantidad: 3,
    unidad: "unid.",
    maquina: "Compresor Central C-01",
    fechaProgramada: "25/10/2026",
    motivo: "Sustitución periódica de filtros de aspiración",
    solicitante: "Carlos Gómez",
    estado: "Consumida",
  },
];

