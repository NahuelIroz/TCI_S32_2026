import { useState } from "react";
import "../App.css";

import ReporteIncidencia from "./reporte_incidencia";
import MisIncidencias from "./MisIncidencias";
import ConsultarStock from "./ConsultarStock";
import EscanearQR from "./scanner";
import IngresarStock from "./IngresarStock";
import RegistrarUsoRepuesto from "./RegistrarUsoRepuesto";
import PedidosCompra from "./PedidosCompra";

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
  | "pedidosCompra";

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

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2Z" />
      <path d="M9 5V3h6v2M8 10h8M8 14h8M8 18h5" />
    </svg>
  );
}

// Íconos de navegación inferior móvil
function NavIcon({
  name,
}: {
  name: "home" | "scan" | "stock" | "tools" | "compras" | "report" | "incidents";
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

  const acciones = getAccionesParaRol(usuario.rol);

  const abrirReporte = () => {
    setPantallaAnterior(pantalla);
    setPantalla("incidencia");
  };

  const ejecutarAccionPorId = (accionId: string) => {
    switch (accionId) {
      case "ingresar-stock":
        setPantalla("ingresarStock");
        break;

      case "consultar-stock":
        setPantalla("stock");
        break;

      case "escanear-qr":
        setPantalla("scan");
        break;

      case "registrar-uso":
        setPantalla("registrarUso");
        break;

      case "pedidos-compra":
        setPantalla("pedidosCompra");
        break;

      case "reportar-incidencia":
        abrirReporte();
        break;

      case "mis-incidencias":
        setPantalla("misIncidencias");
        break;

      default:
        break;
    }
  };

  if (pantalla === "ingresarStock") {
    return <IngresarStock onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "registrarUso") {
    return <RegistrarUsoRepuesto onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "pedidosCompra") {
    return <PedidosCompra onBack={() => setPantalla("home")} />;
  }

  if (pantalla === "stock") {
    return (
      <ConsultarStock
        onBack={() => setPantalla("home")}
        onComprar={() => setPantalla("pedidosCompra")}
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

  return (
    <div className="pharma-app">
      <header className="topbar">
        <a
          className="brand"
          href="#inicio"
          aria-label="Mantenimiento Pharma, inicio"
          onClick={(e) => {
            e.preventDefault();
            setPantalla("home");
          }}
        >
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span>
            <strong>MANTENIMIENTO</strong>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Navegación principal">
          <a
            className="nav-link active"
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              setPantalla("home");
            }}
          >
            Inicio
          </a>

          {esMantenimiento ? (
            <>
              <a
                className="nav-link"
                href="#stock"
                onClick={(event) => {
                  event.preventDefault();
                  setPantalla("stock");
                }}
              >
                Existencias
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

              <a
                className="nav-link"
                href="#ingreso"
                onClick={(event) => {
                  event.preventDefault();
                  setPantalla("ingresarStock");
                }}
              >
                Ingresar Stock
              </a>

              <a
                className="nav-link"
                href="#uso"
                onClick={(event) => {
                  event.preventDefault();
                  setPantalla("registrarUso");
                }}
              >
                Uso en Reparación
              </a>

              <a
                className="nav-link"
                href="#compras"
                onClick={(event) => {
                  event.preventDefault();
                  setPantalla("pedidosCompra");
                }}
              >
                Compras
              </a>
            </>
          ) : (
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
        </nav>

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
      </header>

      <main id="inicio" className="dashboard">
        <section className="welcome-card" aria-label="Perfil de usuario">
          <div className="welcome-user">
            <span className="avatar avatar-large">{usuario.avatar}</span>

            <div>
              <p className="eyebrow">
                {esMantenimiento ? "Panel de mantenimiento" : "Panel de operaciones"}
              </p>
              <h1>Hola, {usuario.nombre}</h1>

              <div className="user-role-line">
                <p className="user-role">
                  <strong>{usuario.titulo}</strong> <span>·</span> {usuario.turno}
                </p>
                <span className="user-role-badge">{usuario.etiqueta}</span>
              </div>
            </div>
          </div>
        </section>

        <section id="acciones" className="quick-actions">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                {esMantenimiento ? "Actividades de mantenimiento" : "Acciones de operario"}
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
            <span className="footer-cross">+</span> Mantenimiento Pharma · Perfil {usuario.titulo}
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

        {esMantenimiento ? (
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
        ) : (
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
      </nav>
    </div>
  );
}
