export type EstadoMaquina = "Operativa" | "En Mantenimiento" | "Detenida" | "Alerta";
export type CriticidadMaquina = "Crítica" | "Media" | "Baja";

export interface MaquinaPlanta {
  id: number;
  codigo: string;
  nombre: string;
  sector: string;
  estado: EstadoMaquina;
  criticidad: CriticidadMaquina;
  oee: number;
  temperatura: string;
  presion: string;
  horasOperacion: number;
  ultimaRevision: string;
  proximoMantenimiento: string;
  responsable: string;
}

export const maquinasPlanta: MaquinaPlanta[] = [
  {
    id: 1,
    codigo: "SEC-ENV-03",
    nombre: "Envasadora Rotativa #03",
    sector: "Línea de Envasado A",
    estado: "Alerta",
    criticidad: "Crítica",
    oee: 78.4,
    temperatura: "68°C",
    presion: "5.8 bar",
    horasOperacion: 4820,
    ultimaRevision: "15/10/2026",
    proximoMantenimiento: "30/10/2026",
    responsable: "Carlos Gómez",
  },
  {
    id: 2,
    codigo: "HYD-PRE-12",
    nombre: "Prensa Hidráulica H-12",
    sector: "Prensas y Formado",
    estado: "En Mantenimiento",
    criticidad: "Crítica",
    oee: 62.1,
    temperatura: "54°C",
    presion: "140 bar",
    horasOperacion: 6150,
    ultimaRevision: "20/10/2026",
    proximoMantenimiento: "02/11/2026",
    responsable: "J. Morales",
  },
  {
    id: 3,
    codigo: "CMP-CTR-01",
    nombre: "Compresor Central C-01",
    sector: "Servicios Centrales",
    estado: "Operativa",
    criticidad: "Crítica",
    oee: 94.2,
    temperatura: "42°C",
    presion: "8.2 bar",
    horasOperacion: 12400,
    ultimaRevision: "25/10/2026",
    proximoMantenimiento: "25/11/2026",
    responsable: "M. López",
  },
  {
    id: 4,
    codigo: "BLS-TRN-04",
    nombre: "Blistera Automática #04",
    sector: "Empaque Secundario",
    estado: "Operativa",
    criticidad: "Media",
    oee: 89.6,
    temperatura: "48°C",
    presion: "6.0 bar",
    horasOperacion: 3200,
    ultimaRevision: "18/10/2026",
    proximoMantenimiento: "10/11/2026",
    responsable: "Carlos Gómez",
  },
  {
    id: 5,
    codigo: "LAV-AMP-02",
    nombre: "Lavadora de Ampollas L-02",
    sector: "Zona Estéril",
    estado: "Detenida",
    criticidad: "Crítica",
    oee: 0.0,
    temperatura: "22°C",
    presion: "0.0 bar",
    horasOperacion: 5100,
    ultimaRevision: "12/10/2026",
    proximoMantenimiento: "31/10/2026",
    responsable: "Sin asignar",
  },
  {
    id: 6,
    codigo: "RCT-SNT-01",
    nombre: "Reactor de Síntesis R-01",
    sector: "Planta Química",
    estado: "Operativa",
    criticidad: "Media",
    oee: 91.0,
    temperatura: "75°C",
    presion: "2.4 bar",
    horasOperacion: 8900,
    ultimaRevision: "22/10/2026",
    proximoMantenimiento: "15/11/2026",
    responsable: "M. López",
  },
];

