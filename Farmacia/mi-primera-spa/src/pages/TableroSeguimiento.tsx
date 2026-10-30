import { maquinasPlanta } from "../data/maquinas";
import { incidencias } from "../data/incidencias";
import { tareasIniciales } from "../data/tareas";
import "./styles.css";

interface TableroSeguimientoProps {
  onBack?: () => void;
  onVerMaquinas?: () => void;
  onVerIncidencias?: () => void;
}

export default function TableroSeguimiento({
  onBack,
  onVerMaquinas,
  onVerIncidencias,
}: TableroSeguimientoProps) {
  const operativas = maquinasPlanta.filter((m) => m.estado === "Operativa").length;
  const enAlerta = maquinasPlanta.filter((m) => m.estado === "Alerta").length;
  const enMantenimiento = maquinasPlanta.filter((m) => m.estado === "En Mantenimiento").length;
  const detenidas = maquinasPlanta.filter((m) => m.estado === "Detenida").length;

  const oeePromedio = (
    maquinasPlanta.reduce((acc, m) => acc + m.oee, 0) / maquinasPlanta.length
  ).toFixed(1);

  const incidenciasActivas = incidencias.filter((i) => i.estado !== "Resuelto").length;
  const preventivosCount = tareasIniciales.filter((t) => t.tipo === "Preventivo").length;
  const correctivosCount = tareasIniciales.filter((t) => t.tipo === "Correctivo").length;

  return (
    <div className="incidencia-container">
      <header className="incidencia-header">
        <button
          type="button"
          className="boton-volver"
          onClick={onBack}
          aria-label="Volver"
        >
          ←
        </button>
        <h1>Tableros de Seguimiento Ejecutivo</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado">
          <p className="subpantalla-descripcion">
Historial y estado de las reparaciones </p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">OEE Global de Planta</span>
            <strong className="kpi-value text-green">{oeePromedio}%</strong>
            <span className="kpi-desc">Meta objetivo: &gt; 80%</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Disponibilidad de Líneas</span>
            <strong className="kpi-value text-blue">91.4%</strong>
            <span className="kpi-desc">Tiempo productivo real</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">MTBF (Tiempo Medio Entre Fallas)</span>
            <strong className="kpi-value text-purple">148 hs</strong>
            <span className="kpi-desc">+12% respecto al mes anterior</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">MTTR (Tiempo Medio Reparación)</span>
            <strong className="kpi-value text-amber">1.6 hs</strong>
            <span className="kpi-desc">Promedio de intervención técnica</span>
          </div>
        </div>

        <div className="tablero-bloque">
          <div className="tablero-bloque-header">
            <h3>Disponibilidad de Maquinaria</h3>
            {onVerMaquinas && (
              <button
                type="button"
                className="link-accion"
                onClick={onVerMaquinas}
              >
                Ver detalle de máquinas →
              </button>
            )}
          </div>

          <div className="maquinas-resumen-grid">
            <div className="resumen-chip chip-operativa">
              <span className="chip-punto punto-verde" />
              <strong>{operativas} Operativas</strong>
            </div>
            <div className="resumen-chip chip-alerta">
              <span className="chip-punto punto-amarillo" />
              <strong>{enAlerta} En Alerta</strong>
            </div>
            <div className="resumen-chip chip-mantenimiento">
              <span className="chip-punto punto-azul" />
              <strong>{enMantenimiento} En Mantenimiento</strong>
            </div>
            <div className="resumen-chip chip-detenida">
              <span className="chip-punto punto-rojo" />
              <strong>{detenidas} Detenidas</strong>
            </div>
          </div>
        </div>

        <div className="tablero-bloque">
          <h3>Estrategia de Mantenimiento (Preventivo vs Correctivo)</h3>
          <p className="tablero-subtexto">
            La planta opera con un enfoque proactivo:{" "}
            <strong>
              {Math.round(
                (preventivosCount / (preventivosCount + correctivosCount || 1)) *
                  100
              )}
              % Preventivo
            </strong>{" "}
            vs{" "}
            <strong>
              {Math.round(
                (correctivosCount / (preventivosCount + correctivosCount || 1)) *
                  100
              )}
              % Correctivo
            </strong>
            .
          </p>

          <div className="barra-comparativa">
            <div
              className="barra-parte barra-verde"
              style={{
                width: `${Math.round(
                  (preventivosCount /
                    (preventivosCount + correctivosCount || 1)) *
                    100
                )}%`,
              }}
            >
              Preventivo ({preventivosCount})
            </div>
            <div
              className="barra-parte barra-naranja"
              style={{
                width: `${Math.round(
                  (correctivosCount /
                    (preventivosCount + correctivosCount || 1)) *
                    100
                )}%`,
              }}
            >
              Correctivo ({correctivosCount})
            </div>
          </div>
        </div>

        <div className="tablero-bloque">
          <div className="tablero-bloque-header">
            <h3>Fallas en Curso e Incidencias</h3>
            {onVerIncidencias && (
              <button
                type="button"
                className="link-accion"
                onClick={onVerIncidencias}
              >
                Ver todas las incidencias →
              </button>
            )}
          </div>
          <p className="tablero-subtexto">
            Actualmente hay <strong>{incidenciasActivas} incidencias</strong> abiertas que requieren seguimiento en planta.
          </p>
          <div className="pedidos-lista">
            {incidencias
              .filter((i) => i.estado !== "Resuelto")
              .map((inc) => (
                <div key={inc.id} className="pedido-card">
                  <div className="pedido-header">
                    <div>
                      <span className="pedido-id">{inc.codigo}</span>
                      <span className="pedido-sku">{inc.maquina}</span>
                    </div>
                    <span
                      className={`badge-estado-pedido ${
                        inc.estado === "Pendiente"
                          ? "badge-pendiente"
                          : "badge-cotizacion"
                      }`}
                    >
                      {inc.estado}
                    </span>
                  </div>
                  <p className="pedido-justificacion">{inc.descripcion}</p>
                  <div className="pedido-meta-gerencia">
                    <span>
                      <strong>Técnico:</strong> {inc.tecnico}
                    </span>
                    <span>
                      <strong>Reportado:</strong> {inc.fecha}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

