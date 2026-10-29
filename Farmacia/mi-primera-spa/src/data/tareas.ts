export type EstadoTarea = "Pendiente" | "En Curso" | "Completada" | "Demorada";
export type PrioridadTarea = "Alta" | "Media" | "Baja";
export type TipoTarea = "Preventivo" | "Correctivo" | "Predictivo";

export interface TareaMantenimiento {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  maquina: string;
  codigoMaquina: string;
  tecnicoAsignado: string;
  prioridad: PrioridadTarea;
  tipo: TipoTarea;
  estado: EstadoTarea;
  fechaLimite: string;
  progreso: number;
  observaciones?: string;
}

export const tareasIniciales: TareaMantenimiento[] = [
  {
    id: 1,
    codigo: "TAR-2026-081",
    titulo: "Cambio de rodamientos de cabezal en envasadora",
    descripcion: "Reemplazo de rodamientos SKF 6204-2RSH por vibración en alta revolución.",
    maquina: "Envasadora Rotativa #03",
    codigoMaquina: "SEC-ENV-03",
    tecnicoAsignado: "Carlos Gómez",
    prioridad: "Alta",
    tipo: "Correctivo",
    estado: "En Curso",
    fechaLimite: "30/10/2026",
    progreso: 65,
    observaciones: "Piezas retiradas del depósito bajo reserva RES-2026-001.",
  },
  {
    id: 2,
    codigo: "TAR-2026-082",
    titulo: "Recalibración de válvula solenoide secundaria",
    descripcion: "Ajuste de presión neumática y prueba de estanqueidad en prensa hidráulica.",
    maquina: "Prensa Hidráulica H-12",
    codigoMaquina: "HYD-PRE-12",
    tecnicoAsignado: "J. Morales",
    prioridad: "Media",
    tipo: "Preventivo",
    estado: "Pendiente",
    fechaLimite: "02/11/2026",
    progreso: 10,
    observaciones: "A la espera de autorización de repuesto solenoide Festo.",
  },
  {
    id: 3,
    codigo: "TAR-2026-083",
    titulo: "Inspección termográfica de tableros eléctricos",
    descripcion: "Monitoreo de puntos calientes en subestación de compresores centrales.",
    maquina: "Compresor Central C-01",
    codigoMaquina: "CMP-CTR-01",
    tecnicoAsignado: "M. López",
    prioridad: "Baja",
    tipo: "Predictivo",
    estado: "Completada",
    fechaLimite: "28/10/2026",
    progreso: 100,
    observaciones: "Temperatura normal en todos los bornes. Informe adjuntado.",
  },
  {
    id: 4,
    codigo: "TAR-2026-084",
    titulo: "Limpieza y desinfección de sellos mecánicos",
    descripcion: "Protocolo GMP de sanitización de sellos mecánicos y sensores en llenadora estéril.",
    maquina: "Lavadora de Ampollas L-02",
    codigoMaquina: "LAV-AMP-02",
    tecnicoAsignado: "Sin asignar",
    prioridad: "Alta",
    tipo: "Preventivo",
    estado: "Pendiente",
    fechaLimite: "31/10/2026",
    progreso: 0,
    observaciones: "Requiere corte de energía coordinado con producción.",
  },
];

