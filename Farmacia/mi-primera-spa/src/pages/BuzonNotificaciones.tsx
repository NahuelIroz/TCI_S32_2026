import { useState } from "react";
import {
  servicioNotificaciones,
  type CorreoNotificacion,
  type TipoNotificacionCorreo,
} from "../services/notificacionesService";
import "./styles.css";

interface BuzonNotificacionesProps {
  onBack?: () => void;
}

export default function BuzonNotificaciones({ onBack }: BuzonNotificacionesProps) {
  const [correos, setCorreos] = useState<CorreoNotificacion[]>(
    servicioNotificaciones.obtenerHistorial()
  );
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const handleMarcarLeido = (id: string) => {
    servicioNotificaciones.marcarComoLeido(id);
    setCorreos([...servicioNotificaciones.obtenerHistorial()]);
  };

  const correosFiltrados = correos.filter((c) => {
    if (filtroTipo === "todos") return true;
    return c.tipo === filtroTipo;
  });

  const getTipoTag = (tipo: TipoNotificacionCorreo) => {
    switch (tipo) {
      case "alerta_umbral":
        return { label: "RN-02 · Umbral Mínimo", clase: "badge-urgente" };
      case "solicitud_compra":
        return { label: "RN-04 · Pedido de Compra", clase: "badge-cotizacion" };
      
        return { label: "RN-01 · Cambio de Parte", clase: "badge-aprobado" };
      case "liberacion_reserva":
        return { label: "RN-05 / RN-10 · Reserva", clase: "badge-pendiente" };
      case "informe_resolucion":
        return { label: "RN-09 · Resolución", clase: "badge-aprobado" };
      default:
        return { label: "Notificación", clase: "badge-cotizacion" };
    }
  };

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
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado">
          <span className="badge-seccion verde"> Puerto de Notificaciones</span>
          <p className="subpantalla-descripcion">
            Visualizador de correos electrónicos despachados por el sistema (incidentes, cambios de parte, solicitudes de compra, resolución de fallas y alertas de umbral).
          </p>
        </div>

      
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Total Despachados</span>
            <strong className="kpi-value text-blue">{correos.length}</strong>
            <span className="kpi-desc">Correos emitidos por el puerto</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">No Leídos</span>
            <strong className="kpi-value text-amber">
              {correos.filter((c) => !c.leido).length}
            </strong>
            <span className="kpi-desc">Avisos pendientes de lectura</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Adaptador</span>
            <strong className="kpi-value text-green">Falso (Mock)</strong>
          </div>
        </div>

        <div className="filtro-tabs">
          <button
            type="button"
            className={`filtro-tab ${filtroTipo === "todos" ? "active" : ""}`}
            onClick={() => setFiltroTipo("todos")}
          >
            Todos ({correos.length})
          </button>
          <button
            type="button"
            className={`filtro-tab ${filtroTipo === "alerta_umbral" ? "active" : ""}`}
            onClick={() => setFiltroTipo("alerta_umbral")}
          >
            Alertas Umbral
          </button>
          <button
            type="button"
            className={`filtro-tab ${filtroTipo === "solicitud_compra" ? "active" : ""}`}
            onClick={() => setFiltroTipo("solicitud_compra")}
          >
            Compras
          </button>
          <button
            type="button"
            className={`filtro-tab ${filtroTipo === "cambio_parte" ? "active" : ""}`}
            onClick={() => setFiltroTipo("cambio_parte")}
          >
            Cambios de Parte
          </button>
          <button
            type="button"
            className={`filtro-tab ${filtroTipo === "incidente" ? "active" : ""}`}
            onClick={() => setFiltroTipo("incidente")}
          >
            Incidentes
          </button>
        </div>

        {/* Listado de Correos */}
        <div className="pedidos-lista">
          {correosFiltrados.map((correo) => {
            const tag = getTipoTag(correo.tipo);
            return (
              <div
                key={correo.id}
                className={`pedido-card ${!correo.leido ? "notificacion-no-leida" : ""}`}
              >
                <div className="pedido-header">
                  <div>
                    <span className="pedido-id">{correo.id}</span>
                    <span className={`badge-estado-pedido ${tag.clase}`}>
                      {tag.label}
                    </span>
                  </div>
                  <span className="timeline-fecha">{correo.fecha}</span>
                </div>

                <h3 className="pedido-titulo">{correo.asunto}</h3>

                <div className="correo-destinatarios-box">
                  <span className="detalle-rotulo">Destinatarios (to):</span>
                  <div className="destinatarios-tags">
                    {correo.destinatarios.map((d) => (
                      <span key={d} className="destinatario-chip">
                        ✉️ {d}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="pedido-justificacion correo-cuerpo-box">
                  {correo.cuerpo}
                </p>

                <div className="pedido-acciones">
                  {!correo.leido ? (
                    <button
                      type="button"
                      className="btn-accion btn-aprobar"
                      onClick={() => handleMarcarLeido(correo.id)}
                    >
                      ✓ Marcar como leído
                    </button>
                  ) : (
                    <span className="estado-finalizado-label">
                      ✓ Correo revisado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

