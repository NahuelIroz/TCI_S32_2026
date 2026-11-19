
import type { RolUsuario } from "./permisos";

import type {
  EstadoIncidenciaAPI,
} from "../services/incidenciasService";

// Define qué roles pueden realizar cada transición
interface ReglaTransicion {
  desde: EstadoIncidenciaAPI;
  hacia: EstadoIncidenciaAPI;
  roles: RolUsuario[];
}

export const reglasTransicion: ReglaTransicion[] = [
  {
    desde: "REPORTADA",
    hacia: "EN_TRIAGE",
    roles: ["ENCARGADO"],
  },
  {
    desde: "EN_TRIAGE",
    hacia: "EN_REPARACION",
    roles: ["MANTENIMIENTO"],
  },
  {
    desde: "EN_TRIAGE",
    hacia: "RECHAZADA",
    roles: ["ENCARGADO"],
  },
  {
    desde: "EN_REPARACION",
    hacia: "RESUELTA",
    roles: ["MANTENIMIENTO"],
  },
  {
    desde: "RESUELTA",
    hacia: "CERRADA",
    roles: ["ENCARGADO"],
  },
];

export function obtenerEstadosPermitidos(
  estadoActual: EstadoIncidenciaAPI,
  rol: RolUsuario
): EstadoIncidenciaAPI[] {
  return reglasTransicion
    .filter(
      (regla) =>
        regla.desde === estadoActual &&
        regla.roles.includes(rol)
    )
    .map((regla) => regla.hacia);
}
