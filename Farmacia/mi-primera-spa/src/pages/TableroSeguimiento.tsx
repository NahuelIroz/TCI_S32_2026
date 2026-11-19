import { useState, useEffect } from "react";
import {
  obtenerTableroResumen,
  type TableroResumen as TableroResumenData,
} from "../services/tableroService";
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
  const [tablero, setTablero] = useState<TableroResumenData | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    async function cargarDatos() {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerTableroResumen();
        if (montado) {
          setTablero(data);
        }
      } catch (err) {
        if (montado) {
          setError(
            err instanceof Error ? err.message : "Error al cargar el tablero de seguimiento"
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

  const maquinas = tablero?.maquinas ?? {
    total: 0,
    operativas: 0,
    en_alerta: 0,
    en_mantenimiento: 0,
    detenidas: 0,
    oee_promedio: 0,
  };

  const incidencias = tablero?.incidencias ?? [];
  const incidenciasActivas = tablero?.incidencias_activas ?? 0;

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
            Estado de las reparaciones y disponibilidad en tiempo real
          </p>
        </div>

        {cargando && (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            <p>Cargando información del tablero...</p>
          </div>
        )}

        {error && (
          <div style={{ padding: "16px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "8px", marginBottom: "16px" }}>
            <p><strong>Error de conexión:</strong> {error}</p>
          </div>
        )}

        {!cargando && (
          <>
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
                  <strong>{maquinas.operativas} Operativas</strong>
                </div>
                <div className="resumen-chip chip-alerta">
                  <span className="chip-punto punto-amarillo" />
                  <strong>{maquinas.en_alerta} En Alerta</strong>
                </div>
                <div className="resumen-chip chip-mantenimiento">
                  <span className="chip-punto punto-azul" />
                  <strong>{maquinas.en_mantenimiento} En Mantenimiento</strong>
                </div>
                <div className="resumen-chip chip-detenida">
                  <span className="chip-punto punto-rojo" />
                  <strong>{maquinas.detenidas} Detenidas</strong>
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

              {incidencias.length === 0 ? (
                <p style={{ color: "#666", fontStyle: "italic", marginTop: "12px" }}>
                  No se registran fallas activas en planta actualmente.
                </p>
              ) : (
                <div className="pedidos-lista">
                  {incidencias.map((inc) => (
                    <div key={inc.id} className="pedido-card">
                      <div className="pedido-header">
                        <div>
                          <span className="pedido-id">{inc.codigo}</span>
                          <span className="pedido-sku">
                            {inc.maquina_codigo} - {inc.maquina_nombre}
                          </span>
                        </div>
                        <span
                          className={`badge-estado-pedido ${
                            inc.estado === "REPORTADA"
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
                          <strong>Turno:</strong> {inc.turno}
                        </span>
                        <span>
                          <strong>Prioridad:</strong> {inc.prioridad}
                        </span>
                        <span>
                          <strong>Reportado:</strong>{" "}
                          {inc.fecha_reporte ? new Date(inc.fecha_reporte).toLocaleDateString() : "-"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
