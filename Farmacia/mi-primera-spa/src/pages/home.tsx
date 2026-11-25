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
import DetalleIncidencia from "./DetalleIncidencia";
import GestionIncidencias from "./GestionIncidencias";
import GestionRepuestos from "./GestionRepuestos";
import GestionMaquinas from "./GestionMaquinas";

import type { Repuesto } from "../data/repuestos";
import {
  PERFILES,
  getAccionesParaRol,
  type PerfilUsuario,
  tienePermiso,
} from "../auth/permisos";

type Pantalla =
  | "home"
  | "incidencia"
  | "misIncidencias"
  | "detalleIncidencia"
  | "gestionIncidencias"
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
  | "gestionarRepuestos"
  | "gestionarMaquinas"
  | "buzonCorreos";

interface HomeProps {
  usuario?: PerfilUsuario;
  onCerrarSesion?: () => void;
}

import Navbar from "../components/Navbar/Navbar";
import ActionSymbol from "../components/icons/ActionIcon";

export default function Home({
  usuario = PERFILES.mantenimiento,
  onCerrarSesion,
}: HomeProps) {
  const [pantalla, setPantalla] = useState<Pantalla>("home");
  const [pantallaAnterior, setPantallaAnterior] = useState<Pantalla>("home");
  const [incidenciaSeleccionadaId, setIncidenciaSeleccionadaId] = useState<number | null>(null);
  const [repuestoSeleccionadoCodigo, setRepuestoSeleccionadoCodigo] = useState<string>("SKU-6204-2R");
  const [repuestoParaCompra, setRepuestoParaCompra] = useState<Repuesto | undefined>(undefined);

  const acciones = getAccionesParaRol(usuario.rol).filter(a => tienePermiso(usuario.rol, a.permiso));

  const abrirReporte = () => {
    setPantallaAnterior(pantalla);
    setPantalla("incidencia");
  };

  const abrirDetalleIncidencia = (id: number) => {
    setPantallaAnterior(pantalla);
    setIncidenciaSeleccionadaId(id);
    setPantalla("detalleIncidencia");
  };

  const ejecutarAccionPorId = (accionId: string) => {
    switch (accionId) {
      case "trazabilidad":
        setPantalla("trazabilidad");
        break;
      case "alta-maquinaria":
        setPantalla("altaMaquinaria");
        break;
      case "reportar-incidencia":
        abrirReporte();
        break;
      case "mis-incidencias":
        setPantalla("misIncidencias");
        break;

      case "gestionar-incidencias":
        setPantalla("gestionIncidencias");
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

      case "gestionar-repuestos":
        if (usuario.rol === "ENCARGADO") {
          setPantalla("gestionarRepuestos");
        }
        break;

      case "gestionar-maquinas":
        if (usuario.rol === "ENCARGADO") {
          setPantalla("gestionarMaquinas");
        }
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

  const renderPantalla = () => {
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
    return (
      <IngresarStock
        onBack={() => setPantalla("home")}
        titulo="Ingresar repuestos al almacén"
        subtitulo="Registrar ingresos y recepciones de pedidos aprobados"
        modoRecepcionCompra={true}
      />
    );
  }

  if (pantalla === "cargarStockRecibido") {
    return (
      <IngresarStock
        onBack={() => setPantalla("home")}
        titulo="Cargar el stock recibido y sus ubicaciones"
        subtitulo="RN-08 · Recepción de pedidos aprobados"
        modoRecepcionCompra={true}
      />
    );
  }

  if (pantalla === "gestionarCompras") {
    return (
      <GestionCompras
        onBack={() => setPantalla("home")}
        rolUsuario={usuario.rol}
      />
    );
  }

  if (pantalla === "gestionarRepuestos" && usuario.rol === "ENCARGADO") {
    return (
      <GestionRepuestos
        onBack={() => setPantalla("home")}
      />
    );
  }

  if (pantalla === "gestionarMaquinas" && usuario.rol === "ENCARGADO") {
    return (
      <GestionMaquinas
        onBack={() => setPantalla("home")}
      />
    );
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

  
if (pantalla === "detalleIncidencia" && incidenciaSeleccionadaId !== null) {
  return (
    <DetalleIncidencia
      incidenciaId={incidenciaSeleccionadaId}
      rolUsuario={usuario.rol}
      onBack={() => setPantalla(pantallaAnterior)}
    />
  );
}

if (pantalla === "gestionIncidencias") {
  return (
    <GestionIncidencias
      onBack={() => setPantalla("home")}
      onVerDetalle={abrirDetalleIncidencia}
    />
  );
}

if (pantalla === "misIncidencias") {
  return (
    <MisIncidencias
      onBack={() => setPantalla("home")}
      onNuevaIncidencia={abrirReporte}
      onVerDetalle={abrirDetalleIncidencia}
    />
  );
}


  const esMantenimiento = usuario.rol === "MANTENIMIENTO";
  const esEncargado = usuario.rol === "ENCARGADO";
  const esGerencia = usuario.rol === "GERENCIA";

  const getBadgeClass = () => {
    if (esEncargado) return "badge-administrar";
    if (esGerencia) return "badge-solo-lectura";
    if (esMantenimiento) return "badge-operar-stock";
    return "badge-operario";
  };

    return (
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

    );
  };

  return (
    <>
      <Navbar usuario={usuario} pantallaActual={pantalla} onInicio={() => setPantalla("home")} onAccion={ejecutarAccionPorId} onCerrarSesion={onCerrarSesion} />
      {pantalla === "home" ? <div className="pharma-app">{renderPantalla()}</div> : renderPantalla()}
    </>
  );
}
