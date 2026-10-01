export type PartStatus = "OK" | "Bajo" | "Crítico";
export type MachineStatus = "Operativa" | "Mantenimiento" | "Fuera de servicio";
export type IncidentStatus = "Abierta" | "En proceso" | "Cerrada";

export interface Part {
  id: string;
  name: string;
  stock: number;
  min: number;
  location: string;
  status: PartStatus;
  machines: string[];
}

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  area: string;
  last: string;
}

export interface Incident {
  id: string;
  machine: string;
  description: string;
  status: IncidentStatus;
  priority: "Alta" | "Media" | "Baja";
  date: string;
}

export interface User {
  name: string;
  role: string;
}