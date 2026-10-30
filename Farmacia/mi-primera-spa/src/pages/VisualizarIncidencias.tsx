import { useState } from "react";
import { incidencias } from "../data/incidencias";
import { tareasIniciales } from "../data/tareas";
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

  const incidenciasFiltradas = incidencias.filter((inc) => {
    if (filtroEstado === "todos") return true;
    return inc.estado.toLowerCase().includes(filtroEstado.toLowerCase());
  });

  const planificadas = tareasIniciales.filter((t) => t.tipo === "Preventivo");

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

            <div className="pedidos-lista">
              {incidenciasFiltradas.map((inc) => (
                <div key={inc.id} className="pedido-card">
                  <div className="pedido-header">
                    <div>
                      <span className="pedido-id">{inc.codigo}</span>
                      <span className="pedido-sku">{inc.codigoMaquina}</span>
                    </div>
                    <span
                      className={`badge-estado-pedido ${
                        inc.estado === "Resuelto"
                          ? "badge-aprobado"
                          : inc.estado === "En Reparación"
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
                      <span className="detalle-rotulo">Técnico responsable:</span>
                      <span className="detalle-valor">{inc.tecnico}</span>
                    </div>
                    <div>
                      <span className="detalle-rotulo">Turno:</span>
                      <span className="detalle-valor">{inc.turno}</span>
                    </div>
                    <div>
                      <span className="detalle-rotulo">Hora de reporte:</span>
                      <span className="detalle-valor">{inc.fecha}</span>
                    </div>
                    <div>
                      <span className="detalle-rotulo">Evidencias fotográficas:</span>
                      <span className="detalle-valor">{inc.adjuntos} adjunto(s)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tabActiva === "planificadas" && (
          <div className="pedidos-lista">
            {planificadas.map((plan) => (
              <div key={plan.id} className="pedido-card">
                <div className="pedido-header">
                  <div>
                    <span className="pedido-id">{plan.codigo}</span>
                    <span className="tarea-tipo-chip">Mantenimiento Preventivo</span>
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
                <p className="pedido-justificacion">{plan.descripcion}</p>

                <div className="pedido-detalles-grid">
                  <div>
                    <span className="detalle-rotulo">Equipo objetivo:</span>
                    <span className="detalle-valor">{plan.maquina}</span>
                  </div>
                  <div>
                    <span className="detalle-rotulo">Técnico designado:</span>
                    <span className="detalle-valor">{plan.tecnicoAsignado}</span>
                  </div>
                  <div>
                    <span className="detalle-rotulo">Fecha de intervención:</span>
                    <span className="detalle-valor text-blue">
                      {plan.fechaLimite}
                    </span>
                  </div>
                  <div>
                    <span className="detalle-rotulo">Estado de avance:</span>
                    <span className="detalle-valor">{plan.progreso}% completado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

