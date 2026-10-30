import { useState } from "react";
import "../App.css";

import ReporteIncidencia from "./reporte_incidencia";
import MisIncidencias from "./MisIncidencias";
import ConsultarStock from "./ConsultarStock";
import EscanearQR from "./scanner";
import IngresarStock from "./IngresarStock";
import RegistrarUsoRepuesto from "./RegistrarUsoRepuesto";
import PedidosCompra from "./PedidosCompra";
import GestionCompras from "./GestionCompras";
import SupervisarTareas from "./SupervisarTareas";
import LiberarReservas from "./LiberarReservas";
import NecesidadesReposicion from "./NecesidadesReposicion";
import TableroSeguimiento from "./TableroSeguimiento";
import VisualizarIncidencias from "./VisualizarIncidencias";
import EstadoMaquinas from "./EstadoMaquinas";
import EstadisticasHistoricos from "./EstadisticasHistoricos";
import NotificacionesCompras from "./NotificacionesCompras";
import TrazabilidadRepuesto from "./TrazabilidadRepuesto";
import AltaMaquinaria from "./AltaMaquinaria";
import BuzonNotificaciones from "./BuzonNotificaciones";

import type { Repuesto } from "../data/repuestos";
import {
  PERFILES,
  getAccionesParaRol,
  type PerfilUsuario,
  type TipoIconoAccion,
} from "../auth/permisos";

type Pantalla =
  | "home"
  | "incidencia"
  | "misIncidencias"
  | "stock"
  | "scan"
  | "ingresarStock"
  | "registrarUso"
  | "pedidosCompra"
  | "gestionarCompras"
  | "cargarStockRecibido"
  | "supervisarTareas"
  | "liberarReservas"
  | "necesidadesReposicion"
  | "tablerosSeguimiento"
  | "visualizarIncidencias"
  | "estadoMaquinas"
  | "estadisticasHistoricos"
  | "notificacionesCompras"
  | "trazabilidad"
  | "altaMaquinaria"
  | "buzonCorreos";

interface HomeProps {
  usuario?: PerfilUsuario;
  onCerrarSesion?: () => void;
}

function ActionSymbol({ name }: { name: TipoIconoAccion }) {
  if (name === "stock-in") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v12M8 11l4 4 4-4" />
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
    );
  }

  if (name === "stock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 3h10l4 4v14H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5M8 12h8M8 16h8" />
      </svg>
    );
  }

  if (name === "scan") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 8h3v3H8zM14 8h2M14 11h3M8 14h3v3H8zM14 15v2" />
      </svg>
    );
  }

  if (name === "tools") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }

  if (name === "compras") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M2 3h3l2.6 11.8a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 6H6" />
      </svg>
    );
  }

  if (name === "report") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 9 16H3L12 3Z" />
        <path d="M12 9v4M12 16h.01" />
      </svg>
    );
  }

  if (name === "incidents") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2Z" />
        <path d="M9 5V3h6v2M8 10h8M8 14h8M8 18h5" />
      </svg>
    );
  }

  if (name === "tasks") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    );
  }

  if (name === "shield-check") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (name === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    );
  }

  if (name === "machine") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }

  if (name === "stats") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      <path d="m9 11 2 2 4-4" />
    </svg>
  );
}

function NavIcon({
  name,
}: {
  name:
  | "home"
  | "scan"
  | "stock"
  | "tools"
  | "compras"
  | "report"
  | "incidents"
  | "tasks"
  | "dashboard"
  | "machine"
  | "bell";
}) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10" />
      </svg>
    );
  }

  if (name === "scan") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 8h3v3H8zM14 8h2M14 11h3M8 14h3v3H8zM14 15v2" />
      </svg>
    );
  }

  if (name === "stock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 3h10l4 4v14H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5M8 12h8M8 16h8" />
      </svg>
    );
  }

  if (name === "tools") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }

  if (name === "compras") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M2 3h3l2.6 11.8a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 6H6" />
      </svg>
    );
  }

  if (name === "report") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 9 16H3L12 3Z" />
        <path d="M12 9v4M12 16h.01" />
      </svg>
    );
  }

  if (name === "tasks") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    );
  }

  if (name === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    );
  }

  if (name === "machine") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2Z" />
      <path d="M9 5V3h6v2M8 10h8M8 14h8M8 18h5" />
    </svg>
  );
}

export default function Home({
  usuario = PERFILES.mantenimiento,
  onCerrarSesion,
}: HomeProps) {
  const [pantalla, setPantalla] = useState<Pantalla>("home");
  const [pantallaAnterior, setPantallaAnterior] = useState<Pantalla>("home");
  const [repuestoSeleccionadoCodigo, setRepuestoSeleccionadoCodigo] = useState<string>("SKU-6204-2R");
  const [repuestoParaCompra, setRepuestoParaCompra] = useState<Repuesto | undefined>(undefined);

  const acciones = getAccionesParaRol(usuario.rol);

  const abrirReporte = () => {
    setPantallaAnterior(pantalla);
    setPantalla("incidencia");
  };

  const ejecutarAccionPorId = (accionId: string) => {
    switch (accionId) {
      case "reportar-incidencia":
        abrirReporte();
        break;
      case "mis-incidencias":
        setPantalla("misIncidencias");
        break;
      case "escanear-qr":
        setPantalla("scan");
        break;

      case "ingresar-stock":
        setPantalla("ingresarStock");
        break;
      case "consultar-stock":
        setPantalla("stock");
        break;
      case "registrar-uso":
        setPantalla("registrarUso");
        break;
      case "pedidos-compra":
        setPantalla("pedidosCompra");
        break;

      case "gestionar-compras":
        setPantalla("gestionarCompras");
        break;
      case "cargar-stock-recibido":
        setPantalla("cargarStockRecibido");
        break;
      case "supervisar-tareas":
        setPantalla("supervisarTareas");
        break;
      case "liberar-reservas":
        setPantalla("liberarReservas");
        break;
      case "necesidades-reposicion":
        setPantalla("necesidadesReposicion");
        break;

      case "tableros-seguimiento":
        setPantalla("tablerosSeguimiento");
        break;
      case "visualizar-incidencias":
        setPantalla("visualizarIncidencias");
        break;
      case "estado-maquinas":
        setPantalla("estadoMaquinas");
        break;
      case "estadisticas-historicos":
        setPantalla("estadisticasHistoricos");
        break;
      case "notificaciones-compras":
        setPantalla("notificacionesCompras");
        break;

      default:
        break;
    }
  };

  if (pantalla === "trazabilidad") {
    return (
      <TrazabilidadRepuesto
        onBack={() => setPantalla("home")}
        repuestoCodigoInicial={repuestoSeleccionadoCodigo}
      />
    );
  }

  if (pantalla === "altaMaquinaria") {
    return (
      <AltaMaquinaria
        onBack={() => setPantalla("estadoMaquinas")}
        onExito={() => setPantalla("estadoMaquinas")}
      />
    );
  }

  if (pantalla === "buzonCorreos") {
    return <BuzonNotificaciones onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "ingresarStock") {
    return <IngresarStock onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "cargarStockRecibido") {
    return (
      <IngresarStock
        onBack={() => setPantalla("home")}
        titulo="Cargar el stock recibido y sus ubicaciones"
        subtitulo="RN-08 · Carga de Compra y Ubicaciones"
      />
    );
  }

  if (pantalla === "gestionarCompras") {
    return <GestionCompras onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "supervisarTareas") {
    return <SupervisarTareas onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "liberarReservas") {
    return <LiberarReservas onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "necesidadesReposicion") {
    return (
      <NecesidadesReposicion
        onBack={() => setPantalla("home")}
        onIrACompras={() => setPantalla("gestionarCompras")}
      />
    );
  }

  if (pantalla === "tablerosSeguimiento") {
    return (
      <TableroSeguimiento
        onBack={() => setPantalla("home")}
        onVerMaquinas={() => setPantalla("estadoMaquinas")}
        onVerIncidencias={() => setPantalla("visualizarIncidencias")}
      />
    );
  }

  if (pantalla === "visualizarIncidencias") {
    return <VisualizarIncidencias onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "estadoMaquinas") {
    return (
      <EstadoMaquinas
        onBack={() => setPantalla("home")}
        onNuevaMaquina={() => setPantalla("altaMaquinaria")}
      />
    );
  }

  if (pantalla === "estadisticasHistoricos") {
    return <EstadisticasHistoricos onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "notificacionesCompras") {
    return <NotificacionesCompras onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "registrarUso") {
    return (
      <RegistrarUsoRepuesto
        onBack={() => setPantalla("home")}
        onGenerarPedidoCompra={(rep) => {
          setRepuestoParaCompra(rep);
          setPantalla("pedidosCompra");
        }}
      />
    );
  }

  if (pantalla === "pedidosCompra") {
    return (
      <PedidosCompra
        onBack={() => setPantalla("home")}
        repuestoInicial={repuestoParaCompra}
      />
    );
  }

  if (pantalla === "stock") {
    return (
      <ConsultarStock
        onBack={() => setPantalla("home")}
        onComprar={(rep) => {
          setRepuestoParaCompra(rep);
          setPantalla("pedidosCompra");
        }}
        onVerTrazabilidad={(rep) => {
          setRepuestoSeleccionadoCodigo(rep.codigo);
          setPantalla("trazabilidad");
        }}
      />
    );
  }

  if (pantalla === "scan") {
    return <EscanearQR onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "incidencia") {
    return (
      <ReporteIncidencia onBack={() => setPantalla(pantallaAnterior)} />
    );
  }

  if (pantalla === "misIncidencias") {
    return (
      <MisIncidencias
        onBack={() => setPantalla("home")}
        onNuevaIncidencia={abrirReporte}
      />
    );
  }

  const esMantenimiento = usuario.rol === "MANTENIMIENTO";
  const esOperario = usuario.rol === "OPERARIO";
  const esEncargado = usuario.rol === "ENCARGADO";
  const esGerencia = usuario.rol === "GERENCIA";

  const getBadgeClass = () => {
    if (esEncargado) return "badge-administrar";
    if (esGerencia) return "badge-solo-lectura";
    if (esMantenimiento) return "badge-operar-stock";
    return "badge-operario";
  };

  const getBrandTitle = () => {
    if (esEncargado) return "ENCARGADO";
    if (esGerencia) return "GERENCIA";
    if (esOperario) return "OPERACIONES";
    return "MANTENIMIENTO";
  };

  return (
    <div className="pharma-app">
      <header className="topbar">
        <a
          className="brand"
          href="#inicio"
          aria-label="Sistema de Gestión Pharma, inicio"
          onClick={(e) => {
            e.preventDefault();
            setPantalla("home");
          }}
        >
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span>
            <strong>{getBrandTitle()}</strong>
          </span>
        </a>


        <nav className="desktop-nav" aria-label="Navegación principal">
          <a
            className="nav-link active" style={{ display: "none" }}
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              setPantalla("home");
            }}
          >
            Inicio
          </a>

          {esOperario && (
            <>
              <a
                className="nav-link"
                href="#reportar"
                onClick={(event) => {
                  event.preventDefault();
                  abrirReporte();
                }}
              >
                Reportar Incidencia
              </a>
              <a
                className="nav-link"
                href="#mis-incidencias"
                onClick={(event) => {
                  event.preventDefault();
                  setPantalla("misIncidencias");
                }}
              >
                Mis Incidencias
              </a>
              <a
                className="nav-link"
                href="#scanner"
                onClick={(event) => {
                  event.preventDefault();
                  setPantalla("scan");
                }}
              >
                Escanear QR
              </a>
            </>
          )}

          {false && esMantenimiento && (
            <>
              
              
              
              <a
                className="nav-link"
                href="#compras"
                onClick={(event) => {
                  event.preventDefault();
                  setPantalla("pedidosCompra");
                }}
              >
                
              </a>
            </>
          )}

          {esEncargado && (
            <>
              <a
                className="nav-link"
                href="#compras"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("gestionarCompras");
                }}
              >
                Gestionar Compras
              </a>
              <a
                className="nav-link"
                href="#stock-recibido"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("cargarStockRecibido");
                }}
              >
                Stock Recibido
              </a>
              <a
                className="nav-link"
                href="#supervisar"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("supervisarTareas");
                }}
              >
                Supervisar Tareas
              </a>
              <a
                className="nav-link"
                href="#reservas"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("liberarReservas");
                }}
              >
                Liberar Reservas
              </a>
              <a
                className="nav-link"
                href="#reposicion"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("necesidadesReposicion");
                }}
              >
                Reposición
              </a>
              <a
                className="nav-link"
                href="#trazabilidad"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("trazabilidad");
                }}
              >
                Trazabilidad
              </a>
              <a
                className="nav-link"
                href="#alta-maquina"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("altaMaquinaria");
                }}
              >
                Nueva Máquina 
              </a>
            </>
          )}

          {esGerencia && (
            <>
              <a
                className="nav-link"
                href="#tableros"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("tablerosSeguimiento");
                }}
              >
                Tableros
              </a>
              <a
                className="nav-link"
                href="#incidencias"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("visualizarIncidencias");
                }}
              >
                Incidencias & Plan
              </a>
              <a
                className="nav-link"
                href="#maquinas"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("estadoMaquinas");
                }}
              >
                Estado Máquinas
              </a>
              <a
                className="nav-link"
                href="#trazabilidad"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("trazabilidad");
                }}
              >
                Trazabilidad (RN-06)
              </a>
              <a
                className="nav-link"
                href="#estadisticas"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("estadisticasHistoricos");
                }}
              >
                Estadísticas
              </a>
              <a
                className="nav-link"
                href="#notificaciones"
                onClick={(e) => {
                  e.preventDefault();
                  setPantalla("notificacionesCompras");
                }}
              >
                Notificaciones Compras
              </a>
            </>
          )}
        </nav>

        <div className="topbar-acciones-derecha">

          <button
            className="topbar-user"
            type="button"
            onClick={() => {
              if (onCerrarSesion && confirm("¿Deseás cerrar la sesión actual?")) {
                onCerrarSesion();
              }
            }}
            aria-label={`Perfil de ${usuario.nombre}. Clic para cerrar sesión`}
            title="Clic para cerrar sesión"
          >
            <span className="avatar avatar-small">{usuario.avatar}</span>
            <span className="topbar-user-name">{usuario.nombre}</span>
            <span className="chevron" aria-hidden="true">
              ⌄
            </span>
          </button>
        </div>
      </header>

      <main id="inicio" className="dashboard">
        <section className="welcome-card" aria-label="Perfil de usuario">
          <div className="welcome-user">
            <span className="avatar avatar-large">{usuario.avatar}</span>

            <div>
              <p className="eyebrow">
                {esEncargado
                  ? "Panel de gestión y administración de mantenimiento"
                  : esGerencia
                    ? "Panel ejecutivo de control y monitoreo"
                    : esMantenimiento
                      ? "Panel de operaciones de mantenimiento"
                      : "Panel de operaciones de planta"}
              </p>
              <h1>Hola, {usuario.nombre}</h1>

              <div className="user-role-line">
                <p className="user-role">
                  <strong>{usuario.titulo}</strong> <span>·</span> {usuario.turno}
                </p>
                <span className={`user-role-badge ${getBadgeClass()}`}>
                  {usuario.etiqueta}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="acciones" className="quick-actions">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                {esEncargado
                  ? "Funciones de gestión técnica"
                  : esGerencia
                    ? "Acciones gerenciales y auditoría"
                    : esMantenimiento
                      ? "Actividades de mantenimiento"
                      : "Acciones de operario"}
              </p>
              <h2>¿Qué necesitás hacer?</h2>
            </div>
            <span className="section-note">
              {acciones.length} acciones disponibles
            </span>
          </div>

          <div className="action-grid">
            {acciones.map((action) => (
              <button
                className="action-card"
                type="button"
                key={action.id}
                onClick={() => ejecutarAccionPorId(action.id)}
              >
                <span className={`action-icon ${action.color}`}>
                  <ActionSymbol name={action.icono} />
                </span>

                <span className="action-copy">
                  <strong>{action.titulo}</strong>
                  <span>{action.descripcion}</span>
                </span>

                <span className="action-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>
            <span className="footer-cross">+</span> Mantenimiento  · Perfil {usuario.titulo} · Reglas RN-01 a RN-10 activas
          </span>
        </footer>
      </main>

      <nav className="mobile-nav" aria-label="Navegación inferior">
        <a
          className="mobile-nav-item selected"
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            setPantalla("home");
          }}
        >
          <NavIcon name="home" />
          <span>Inicio</span>
        </a>

        {esOperario && (
          <>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={abrirReporte}
            >
              <NavIcon name="report" />
              <span>Reportar</span>
            </button>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("misIncidencias")}
            >
              <NavIcon name="incidents" />
              <span>Incidencias</span>
            </button>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("scan")}
            >
              <NavIcon name="scan" />
              <span>Escanear</span>
            </button>
          </>
        )}

        {esMantenimiento && (
          <>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("stock")}
            >
              <NavIcon name="stock" />
              <span>Stock</span>
            </button>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("scan")}
            >
              <NavIcon name="scan" />
              <span>Escanear</span>
            </button>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("registrarUso")}
            >
              <NavIcon name="tools" />
              <span>Uso</span>
            </button>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("pedidosCompra")}
            >
              <NavIcon name="compras" />
              <span>Compras</span>
            </button>
          </>
        )}

        {esEncargado && (
          <>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("gestionarCompras")}
            >
              <NavIcon name="compras" />
              <span>Compras</span>
            </button>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("supervisarTareas")}
            >
              <NavIcon name="tasks" />
              <span>Tareas</span>
            </button>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("liberarReservas")}
            >
              <NavIcon name="stock" />
              <span>Reservas</span>
            </button>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("necesidadesReposicion")}
            >
              <NavIcon name="tools" />
              <span>Reposición</span>
            </button>
          </>
        )}

        {esGerencia && (
          <>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("tablerosSeguimiento")}
            >
              <NavIcon name="dashboard" />
              <span>Tableros</span>
            </button>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("visualizarIncidencias")}
            >
              <NavIcon name="incidents" />
              <span>Incidencias</span>
            </button>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("estadoMaquinas")}
            >
              <NavIcon name="machine" />
              <span>Máquinas</span>
            </button>
            <button
              className="mobile-nav-item"
              type="button"
              onClick={() => setPantalla("notificacionesCompras")}
            >
              <NavIcon name="bell" />
              <span>Avisos</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
