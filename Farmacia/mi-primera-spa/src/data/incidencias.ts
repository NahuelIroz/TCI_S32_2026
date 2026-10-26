
export type EstadoIncidencia =
  | "Pendiente"
  | "En Reparación"
  | "Resuelto";

export interface Incidencia {
  id: number;
  codigo: string;
  maquina: string;
  codigoMaquina: string;
  descripcion: string;
  fecha: string;
  estado: EstadoIncidencia;
  turno: string;
  tecnico: string;
  adjuntos: number;
}

export const incidencias: Incidencia[] = [
  {
    id: 1,
    codigo: "INC-1042",
    maquina: "Envasadora Rotativa #03",
    codigoMaquina: "SEC-ENV-03",
    descripcion:
      "Fuga de lubricante en eje principal y ruido excesivo en rodamientos. Posible sobrecalentamiento.",
    fecha: "Hace 25 min",
    estado: "Pendiente",
    turno: "Mañana",
    tecnico: "Sin asignar",
    adjuntos: 2,
  },
  {
    id: 2,
    codigo: "INC-1039",
    maquina: "Prensa Hidráulica H-12",
    codigoMaquina: "HYD-PRE-12",
    descripcion:
      "Caída de presión en manómetro secundario. Requiere cambio de válvula solenoide y recalibración.",
    fecha: "Hoy 04:15",
    estado: "En Reparación",
    turno: "Noche",
    tecnico: "J. Morales",
    adjuntos: 0,
  },
  {
    id: 3,
    codigo: "INC-1028",
    maquina: "Compresor Central C-01",
    codigoMaquina: "CMP-CTR-01",
    descripcion:
      "Sustitución de filtro de aire y purga automática realizada. Parámetros estabilizados.",
    fecha: "Ayer 18:20",
    estado: "Resuelto",
    turno: "Tarde",
    tecnico: "M. López",
    adjuntos: 1,
  },
];
