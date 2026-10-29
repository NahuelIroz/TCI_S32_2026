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
  | "tableros.consultar";

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
    "stock.consultar",
    "stock.ingresar",
    "compras.gestionar",
    "reservas.liberar",
    "tareas.supervisar",
  ],

  GERENCIA: [
    "tableros.consultar",
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
  operario: {
    id: "operario",
    usuario: "operario",
    nombre: "Juan Pérez",
    rol: "OPERARIO",
    titulo: "Operario de planta",
    etiqueta: "Reportar incidencias",
    turno: "Turno Mañana",
    avatar: "JP",
  },
  admin: {
    id: "admin",
    usuario: "admin",
    nombre: "Carlos Gómez",
    rol: "MANTENIMIENTO",
    titulo: "Empleado de mantenimiento",
    etiqueta: "Operar stock",
    turno: "Turno Mañana",
    avatar: "EM",
  },
};


export type TipoIconoAccion =
  | "stock-in"
  | "stock"
  | "scan"
  | "tools"
  | "compras"
  | "report"
  | "incidents";

export interface AccionPerfil {
  id: string;
  permiso: Permiso;
  titulo: string;
  descripcion: string;
  icono: TipoIconoAccion;
  color: "blue" | "green" | "purple" | "orange" | "teal";
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
