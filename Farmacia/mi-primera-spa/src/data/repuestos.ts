
export type EstadoStock =
  | "Disponible"
  | "Stock Bajo"
  | "Agotado";

export interface Repuesto {
  id: number;
  codigo: string;
  nombre: string;
  disponible: number;
  minimo: number;
  unidad: string;
  estado: EstadoStock;
}

export const repuestos: Repuesto[] = [
  {
    id: 1,
    codigo: "SKU-6204-2R",
    nombre: "Rodamiento Rígido de Bolas SKF 6204-2RSH",
    disponible: 28,
    minimo: 10,
    unidad: "unid.",
    estado: "Disponible",
  },
  {
    id: 2,
    codigo: "SKU-VLV-420",
    nombre: "Válvula Solenoide Festo 24V DC 5/2",
    disponible: 2,
    minimo: 5,
    unidad: "unid.",
    estado: "Stock Bajo",
  },
  {
    id: 3,
    codigo: "SKU-FLT-880",
    nombre: "Filtro de Aire Compresor Atlas Copco",
    disponible: 15,
    minimo: 4,
    unidad: "unid.",
    estado: "Disponible",
  },
  {
    id: 4,
    codigo: "SKU-COR-900",
    nombre: "Correa Dentada Sincrónica 8M",
    disponible: 0,
    minimo: 3,
    unidad: "unid.",
    estado: "Agotado",
  },
];
