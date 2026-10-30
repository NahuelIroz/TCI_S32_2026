import { useState } from "react";
import {
  pedidosCompraIniciales,
  type PedidoCompraItem,
} from "../data/pedidosCompraData";
import "./styles.css";

interface NotificacionesComprasProps {
  onBack?: () => void;
}

export default function NotificacionesCompras({
  onBack,
}: NotificacionesComprasProps) {
  const [pedidos, setPedidos] = useState<PedidoCompraItem[]>(pedidosCompraIniciales);

  const handleMarcarLeida = (id: string) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, notificacionLeida: true } : p))
    );
  };

  const handleMarcarTodasLeidas = () => {
    setPedidos((prev) =>
      prev.map((p) => ({ ...p, notificacionLeida: true }))
    );
  };

  const noLeidas = pedidos.filter((p) => !p.notificacionLeida).length;

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
        <h1>Notificaciones de Pedidos de Compra</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado-con-accion">
          <div>
            <span className="badge-seccion gris">Gerencia · RN-09</span>
            <p className="subpantalla-descripcion">
              Canal de avisos ejecutivos y notificaciones automáticas para compras urgentes e insumos de mantenimiento.
            </p>
          </div>
          {noLeidas > 0 && (
            <button
              type="button"
              className="btn-nueva-incidencia"
              onClick={handleMarcarTodasLeidas}
            >
              ✓ Marcar todas como leídas
            </button>
          )}
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Avisos Pendientes</span>
            <strong className="kpi-value text-amber">{noLeidas}</strong>
            <span className="kpi-desc">Notificaciones sin abrir</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Canal Automático</span>
            <strong className="kpi-value text-blue">RN-09</strong>
            <span className="kpi-desc">Supervisores & Gerencia</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Total Solicitudes</span>
            <strong className="kpi-value text-purple">{pedidos.length}</strong>
            <span className="kpi-desc">Órdenes registradas este mes</span>
          </div>
        </div>

        <div className="pedidos-lista">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className={`pedido-card ${
                !pedido.notificacionLeida ? "notificacion-no-leida" : ""
              }`}
            >
              <div className="pedido-header">
                <div>
                  <span className="pedido-id">{pedido.id}</span>
                  {!pedido.notificacionLeida && (
                    <span className="notificacion-punto-nuevo">NUEVO</span>
                  )}
                  <span className="pedido-sku">{pedido.codigo}</span>
                </div>
                <div className="pedido-badges">
                  <span
                    className={`badge-prioridad ${
                      pedido.prioridad === "Urgente"
                        ? "badge-urgente"
                        : pedido.prioridad === "Media"
                        ? "badge-media"
                        : "badge-baja"
                    }`}
                  >
                    {pedido.prioridad}
                  </span>
                  <span className="badge-estado-pedido badge-cotizacion">
                    {pedido.estado}
                  </span>
                </div>
              </div>

              <h3 className="pedido-titulo">
                Solicitud de reposición: {pedido.repuestoNombre}
              </h3>

              <p className="pedido-justificacion">
                <strong>Motivo / Justificación:</strong> {pedido.justificacion}
              </p>

              <div className="pedido-detalles-grid">
                <div>
                  <span className="detalle-rotulo">Cantidad solicitada:</span>
                  <span className="detalle-valor">
                    {pedido.cantidad} {pedido.unidad}
                  </span>
                </div>
                <div>
                  <span className="detalle-rotulo">Impacto presupuestario:</span>
                  <span className="detalle-valor text-blue">
                    ${pedido.montoEstimado.toLocaleString("es-AR")}
                  </span>
                </div>
                <div>
                  <span className="detalle-rotulo">Solicitante:</span>
                  <span className="detalle-valor">{pedido.solicitante}</span>
                </div>
                <div>
                  <span className="detalle-rotulo">Fecha de emisión:</span>
                  <span className="detalle-valor">{pedido.fecha}</span>
                </div>
              </div>

              <div className="pedido-acciones">
                {!pedido.notificacionLeida ? (
                  <button
                    type="button"
                    className="btn-accion btn-aprobar"
                    onClick={() => handleMarcarLeida(pedido.id)}
                  >
                    ✓ Tomar conocimiento y archivar aviso
                  </button>
                ) : (
                  <span className="estado-finalizado-label">
                    ✓ Notificación leída y registrada en auditoría
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

