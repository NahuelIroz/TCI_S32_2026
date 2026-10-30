export type RolUsuario =
  | "OPERARIO"
  | "MANTENIMIENTO"
  | "ENCARGADO"
  | "GERENCIA";

export type Permiso =
  | "incidencias.crear"
  | "maquinas.escanear"
  | "incidencias.consultar"
  | "stock.consultar"
  | "stock.ingresar"
  | "reparaciones.registrar_uso"
  | "compras.crear"
  | "compras.gestionar"
  | "reservas.liberar"
  | "tareas.supervisar"
  | "tableros.consultar"
  | "maquinas.consultar"
  | "estadisticas.consultar"
  | "compras.notificaciones";

export const permisosPorRol: Record<RolUsuario, Permiso[]> = {
  OPERARIO: [
    "incidencias.crear",
    "incidencias.consultar",
    "maquinas.escanear",
  ],

  MANTENIMIENTO: [
    "stock.ingresar",
    "stock.consultar",
    "maquinas.escanear",
    "reparaciones.registrar_uso",
    "compras.crear",
  ],

  ENCARGADO: [
    "compras.gestionar",
    "stock.ingresar",
    "tareas.supervisar",
    "reservas.liberar",
    "stock.consultar",
    "maquinas.consultar",
  ],

  GERENCIA: [
    "tableros.consultar",
    "incidencias.consultar",
    "maquinas.consultar",
    "estadisticas.consultar",
    "compras.notificaciones",
    "compras.gestionar",
  ],
};

export function tienePermiso(
  rol: RolUsuario,
  permiso: Permiso
): boolean {
  return permisosPorRol[rol].includes(permiso);
}

export interface PerfilUsuario {
  id: string;
  usuario: string;
  nombre: string;
  rol: RolUsuario;
  titulo: string;
  etiqueta: string;
  turno: string;
  avatar: string;
}

export const PERFILES: Record<string, PerfilUsuario> = {
  operario: {
    id: "operario",
    usuario: "operario",
    nombre: "Juan Pérez",
    rol: "OPERARIO",
    titulo: "Operario de planta",
    etiqueta: "",
    turno: "Turno Mañana",
    avatar: "JP",
  },
  mantenimiento: {
    id: "mantenimiento",
    usuario: "mantenimiento",
    nombre: "Carlos Gómez",
    rol: "MANTENIMIENTO",
    titulo: "Empleado de mantenimiento",
    etiqueta: "Operar stock",
    turno: "Turno Mañana",
    avatar: "EM",
  },
  encargado: {
    id: "encargado",
    usuario: "encargado",
    nombre: "Ing. Martín Bianchi",
    rol: "ENCARGADO",
    titulo: "Encargado de mantenimiento",
    etiqueta: "Administrar",
    turno: "Turno Central",
    avatar: "MB",
  },
  gerencia: {
    id: "gerencia",
    usuario: "gerencia",
    nombre: "Lic. Valeria Rossi",
    rol: "GERENCIA",
    titulo: "Gerencia / Administración",
    etiqueta: "Solo lectura",
    turno: "Sede Central",
    avatar: "VR",
  },
  admin: {
    id: "admin",
    usuario: "admin",
    nombre: "Ing. Martín Bianchi",
    rol: "ENCARGADO",
    titulo: "Encargado de mantenimiento",
    etiqueta: "Administrar",
    turno: "Turno Central",
    avatar: "MB",
  },
};

export type TipoIconoAccion =
  | "stock-in"
  | "stock"
  | "scan"
  | "tools"
  | "compras"
  | "report"
  | "incidents"
  | "tasks"
  | "shield-check"
  | "dashboard"
  | "machine"
  | "stats"
  | "bell"
  | "cart-check";

export interface AccionPerfil {
  id: string;
  permiso: Permiso;
  titulo: string;
  descripcion: string;
  icono: TipoIconoAccion;
  color: "blue" | "green" | "purple" | "orange" | "teal" | "slate";
}

export function getAccionesParaRol(rol: RolUsuario): AccionPerfil[] {
  if (rol === "OPERARIO") {
    return [
      {
        id: "reportar-incidencia",
        permiso: "incidencias.crear",
        titulo: "Reportar incidencia",
        descripcion: "Foto + máquina + descripción de la falla",
        icono: "report",
        color: "purple",
      },
      {
        id: "mis-incidencias",
        permiso: "incidencias.consultar",
        titulo: "Mis incidencias",
        descripcion: "Ver estado y seguimiento de mis reportes",
        icono: "incidents",
        color: "blue",
      },
      {
        id: "escanear-qr",
        permiso: "maquinas.escanear",
        titulo: "Escanear códigos QR o de barras",
        descripcion: "Identificar máquinas y equipos con la cámara",
        icono: "scan",
        color: "teal",
      },
    ];
  }

  if (rol === "MANTENIMIENTO") {
    return [
      {
        id: "ingresar-stock",
        permiso: "stock.ingresar",
        titulo: "Ingresar repuestos al almacén",
        descripcion: "Alta y recepción de repuestos en depósito",
        icono: "stock-in",
        color: "green",
      },
      {
        id: "consultar-stock",
        permiso: "stock.consultar",
        titulo: "Consultar existencias y ubicaciones",
        descripcion: "Buscar piezas, stock disponible y estanterías",
        icono: "stock",
        color: "blue",
      },
      {
        id: "escanear-qr",
        permiso: "maquinas.escanear",
        titulo: "Escanear códigos QR o de barras",
        descripcion: "Identificar piezas o máquinas con la cámara",
        icono: "scan",
        color: "teal",
      },
      {
        id: "registrar-uso",
        permiso: "reparaciones.registrar_uso",
        titulo: "Registrar repuestos en reparación",
        descripcion: "Descontar repuestos y cantidades utilizadas",
        icono: "tools",
        color: "orange",
      },
      {
        id: "pedidos-compra",
        permiso: "compras.crear",
        titulo: "Reportar faltantes y pedidos de compra",
        descripcion: "Generar solicitudes de reposición de materiales",
        icono: "compras",
        color: "purple",
      },
    ];
  }

  if (rol === "ENCARGADO") {
    return [
      {
        id: "gestionar-compras",
        permiso: "compras.gestionar",
        titulo: "Gestionar la lista de compras.",
        descripcion: "Revisar cotizaciones, autorizar o rechazar solicitudes de compra",
        icono: "cart-check",
        color: "green",
      },
      {
        id: "cargar-stock-recibido",
        permiso: "stock.ingresar",
        titulo: "Cargar el stock recibido y sus ubicaciones.",
        descripcion: "Registrar remitos de ingreso y asignar ubicación física en depósito",
        icono: "stock-in",
        color: "blue",
      },
      {
        id: "supervisar-tareas",
        permiso: "tareas.supervisar",
        titulo: "Delegar tareas y supervisar su cumplimiento.",
        descripcion: "Asignar trabajos a técnicos y auditar avance de preventivos",
        icono: "tasks",
        color: "orange",
      },
      {
        id: "liberar-reservas",
        permiso: "reservas.liberar",
        titulo: "Autorizar la liberación de repuestos reservados.",
        descripcion: "Aprobación formal de piezas retenidas para mantenimiento (RN-05)",
        icono: "shield-check",
        color: "purple",
      },
      {
        id: "necesidades-reposicion",
        permiso: "stock.consultar",
        titulo: "Consultar pedidos y necesidades de reposición.",
        descripcion: "Monitorear faltantes críticos, consumo proyectado y puntos de reorden",
        icono: "stock",
        color: "teal",
      },
    ];
  }

  // GERENCIA
  return [
    {
      id: "tableros-seguimiento",
      permiso: "tableros.consultar",
      titulo: "Consultar tableros de seguimiento.",
      descripcion: "Indicadores ejecutivos, disponibilidad global y cumplimiento OEE",
      icono: "dashboard",
      color: "blue",
    },
    {
      id: "visualizar-incidencias",
      permiso: "incidencias.consultar",
      titulo: "Visualizar incidencias y reparaciones planificadas.",
      descripcion: "Seguimiento en tiempo real de paradas y calendario de trabajos",
      icono: "incidents",
      color: "orange",
    },
    {
      id: "estado-maquinas",
      permiso: "maquinas.consultar",
      titulo: "Consultar el estado de las máquinas.",
      descripcion: "Parque de maquinaria con telemetría, semáforo operativo y criticidad",
      icono: "machine",
      color: "teal",
    },
    {
      id: "estadisticas-historicos",
      permiso: "estadisticas.consultar",
      titulo: "Ver estadísticas e históricos.",
      descripcion: "Métricas MTTR/MTBF, tasa de averías y costos de repuestos acumulados",
      icono: "stats",
      color: "purple",
    },
    {
      id: "notificaciones-compras",
      permiso: "compras.notificaciones",
      titulo: "Aprobar compras y pedidos de repuestos.",
      descripcion: "Autorizar compras de repuestos, evaluar presupuesto y cotizaciones",
      icono: "cart-check",
      color: "green",
    },
  ];
}
