import { useState, useEffect } from "react";
import {
  obtenerIncidenciasDetalladas,
  type IncidenciaDetalleAPI,
} from "../services/incidenciasService";
import {
  obtenerTareas,
  type TareaAPI,
} from "../services/tareasService";
import "./styles.css";

interface VisualizarIncidenciasProps {
  onBack?: () => void;
}

export default function VisualizarIncidencias({
  onBack,
}: VisualizarIncidenciasProps) {
  const [tabActiva, setTabActiva] = useState<"incidencias" | "planificadas">(
    "incidencias"
  );
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [incidencias, setIncidencias] = useState<IncidenciaDetalleAPI[]>([]);
  const [planificadas, setPlanificadas] = useState<TareaAPI[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    async function cargarDatos() {
      try {
        setCargando(true);
        setError(null);
        const [incidenciasData, tareasData] = await Promise.all([
          obtenerIncidenciasDetalladas(),
          obtenerTareas("Preventivo"),
        ]);
        if (montado) {
          setIncidencias(incidenciasData);
          setPlanificadas(tareasData);
        }
      } catch (err) {
        if (montado) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar incidencias y reparaciones"
          );
        }
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      montado = false;
    };
  }, []);

  const incidenciasFiltradas = incidencias.filter((inc) => {
    if (filtroEstado === "todos") return true;
    if (filtroEstado === "reparación") {
      return (
        inc.estado.toUpperCase() === "EN_REPARACION" ||
        inc.estado.toLowerCase().includes("reparación")
      );
    }
    if (filtroEstado === "resuelto") {
      return (
        inc.estado.toUpperCase() === "RESUELTA" ||
        inc.estado.toLowerCase().includes("resuelt")
      );
    }
    return true;
  });

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
        <h1>Incidencias y Reparaciones Planificadas</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado">
          <p className="subpantalla-descripcion">
            Visualización y auditoría en tiempo real de eventos no programados y cronograma de paradas preventivas.
          </p>
        </div>

        {cargando && (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            <p>Cargando información en tiempo real...</p>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <p>
              <strong>Error de conexión:</strong> {error}
            </p>
          </div>
        )}

        {!cargando && (
          <>
            <div className="filtro-tabs">
              <button
                type="button"
                className={`filtro-tab ${
                  tabActiva === "incidencias" ? "active" : ""
                }`}
                onClick={() => setTabActiva("incidencias")}
              >
                Incidencias de Planta ({incidencias.length})
              </button>
              <button
                type="button"
                className={`filtro-tab ${
                  tabActiva === "planificadas" ? "active" : ""
                }`}
                onClick={() => setTabActiva("planificadas")}
              >
                Reparaciones Planificadas ({planificadas.length})
              </button>
            </div>

            {tabActiva === "incidencias" && (
              <>
                <div className="filtro-tabs">
                  <button
                    type="button"
                    className={`filtro-tab ${
                      filtroEstado === "todos" ? "active" : ""
                    }`}
                    onClick={() => setFiltroEstado("todos")}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    className={`filtro-tab ${
                      filtroEstado === "reparación" ? "active" : ""
                    }`}
                    onClick={() => setFiltroEstado("reparación")}
                  >
                    En Reparación
                  </button>
                  <button
                    type="button"
                    className={`filtro-tab ${
                      filtroEstado === "resuelto" ? "active" : ""
                    }`}
                    onClick={() => setFiltroEstado("resuelto")}
                  >
                    Resueltas
                  </button>
                </div>

                {incidenciasFiltradas.length === 0 ? (
                  <p
                    style={{
                      color: "#666",
                      fontStyle: "italic",
                      marginTop: "16px",
                      textAlign: "center",
                    }}
                  >
                    No se registran incidencias para el filtro seleccionado.
                  </p>
                ) : (
                  <div className="pedidos-lista">
                    {incidenciasFiltradas.map((inc) => (
                      <div key={inc.id} className="pedido-card">
                        <div className="pedido-header">
                          <div>
                            <span className="pedido-id">{inc.codigo}</span>
                            <span className="pedido-sku">
                              {inc.codigo_maquina}
                            </span>
                          </div>
                          <span
                            className={`badge-estado-pedido ${
                              inc.estado === "RESUELTA" || inc.estado === "CERRADA"
                                ? "badge-aprobado"
                                : inc.estado === "EN_REPARACION"
                                ? "badge-cotizacion"
                                : "badge-pendiente"
                            }`}
                          >
                            {inc.estado}
                          </span>
                        </div>

                        <h3 className="pedido-titulo">{inc.maquina}</h3>
                        <p className="pedido-justificacion">{inc.descripcion}</p>

                        <div className="pedido-detalles-grid">
                          <div>
                            <span className="detalle-rotulo">
                              Técnico responsable:
                            </span>
                            <span className="detalle-valor">{inc.tecnico}</span>
                          </div>
                          <div>
                            <span className="detalle-rotulo">Turno:</span>
                            <span className="detalle-valor">{inc.turno}</span>
                          </div>
                          <div>
                            <span className="detalle-rotulo">
                              Hora de reporte:
                            </span>
                            <span className="detalle-valor">
                              {inc.fecha_reporte
                                ? new Date(inc.fecha_reporte).toLocaleDateString()
                                : "-"}
                            </span>
                          </div>
                          <div>
                            <span className="detalle-rotulo">
                              Evidencias fotográficas:
                            </span>
                            <span className="detalle-valor">
                              {inc.adjuntos} adjunto(s)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tabActiva === "planificadas" && (
              <>
                {planificadas.length === 0 ? (
                  <p
                    style={{
                      color: "#666",
                      fontStyle: "italic",
                      marginTop: "16px",
                      textAlign: "center",
                    }}
                  >
                    No hay reparaciones preventivas planificadas.
                  </p>
                ) : (
                  <div className="pedidos-lista">
                    {planificadas.map((plan) => (
                      <div key={plan.id} className="pedido-card">
                        <div className="pedido-header">
                          <div>
                            <span className="pedido-id">{plan.codigo}</span>
                            <span className="tarea-tipo-chip">
                              Mantenimiento {plan.tipo}
                            </span>
                          </div>
                          <span
                            className={`badge-prioridad ${
                              plan.prioridad === "Alta"
                                ? "badge-urgente"
                                : "badge-media"
                            }`}
                          >
                            Prioridad {plan.prioridad}
                          </span>
                        </div>

                        <h3 className="pedido-titulo">{plan.titulo}</h3>
                        <p className="pedido-justificacion">
                          {plan.descripcion}
                        </p>

                        <div className="pedido-detalles-grid">
                          <div>
                            <span className="detalle-rotulo">
                              Equipo objetivo:
                            </span>
                            <span className="detalle-valor">
                              {plan.codigo_maquina} - {plan.maquina}
                            </span>
                          </div>
                          <div>
                            <span className="detalle-rotulo">
                              Técnico designado:
                            </span>
                            <span className="detalle-valor">
                              {plan.tecnico_asignado}
                            </span>
                          </div>
                          <div>
                            <span className="detalle-rotulo">
                              Fecha de intervención:
                            </span>
                            <span className="detalle-valor text-blue">
                              {plan.fecha_limite}
                            </span>
                          </div>
                          <div>
                            <span className="detalle-rotulo">
                              Estado de avance:
                            </span>
                            <span className="detalle-valor">
                              {plan.progreso}% completado ({plan.estado})
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
