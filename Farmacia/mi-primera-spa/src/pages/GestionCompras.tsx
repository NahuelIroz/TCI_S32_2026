import { useState } from "react";
import {
  pedidosCompraIniciales,
  type PedidoCompraItem,
  type EstadoPedido,
} from "../data/pedidosCompraData";
import "./styles.css";

interface GestionComprasProps {
  onBack?: () => void;
}

export default function GestionCompras({ onBack }: GestionComprasProps) {
  const [pedidos, setPedidos] = useState<PedidoCompraItem[]>(pedidosCompraIniciales);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [mensajeFeedback, setMensajeFeedback] = useState<string>("");

  const handleCambiarEstado = (id: string, nuevoEstado: EstadoPedido) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
    );
    setMensajeFeedback(`Pedido ${id} actualizado a estado: "${nuevoEstado}".`);
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroEstado === "todos") return true;
    return p.estado.toLowerCase().includes(filtroEstado.toLowerCase());
  });

  const totalPendientes = pedidos.filter(
    (p) => p.estado === "Pendiente de aprobación"
  ).length;

  const totalUrgentes = pedidos.filter(
    (p) => p.prioridad === "Urgente" && p.estado !== "Recibido" && p.estado !== "Rechazado"
  ).length;

  const montoTotalComprometido = pedidos
    .filter((p) => p.estado === "Aprobado" || p.estado === "En cotización")
    .reduce((acc, curr) => acc + curr.montoEstimado, 0);

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
        <h1>Gestión de Lista de Compras</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado">
          <span className="badge-seccion verde">Administrar · Compras</span>
          <p className="subpantalla-descripcion">
            Revisión, aprobación y cotización de requerimientos de compra y reposición para planta.
          </p>
        </div>

        {mensajeFeedback && (
          <div className="feedback-banner feedback-banner-success" role="status">
            <span>✓</span> {mensajeFeedback}
          </div>
        )}

        
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Pendientes Aprobación</span>
            <strong className="kpi-value text-amber">{totalPendientes}</strong>
            <span className="kpi-desc">Requieren tu visto bueno</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Urgencias Activas</span>
            <strong className="kpi-value text-red">{totalUrgentes}</strong>
            <span className="kpi-desc">Piezas con stock en cero</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Monto en Curso</span>
            <strong className="kpi-value text-blue">
              ${montoTotalComprometido.toLocaleString("es-AR")}
            </strong>
            <span className="kpi-desc">Aprobado y en cotización</span>
          </div>
        </div>

        <div className="filtro-tabs">
          <button
            type="button"
            className={`filtro-tab ${filtroEstado === "todos" ? "active" : ""}`}
            onClick={() => setFiltroEstado("todos")}
          >
            Todos ({pedidos.length})
          </button>
          <button
            type="button"
            className={`filtro-tab ${
              filtroEstado === "pendiente" ? "active" : ""
            }`}
            onClick={() => setFiltroEstado("pendiente")}
          >
            Pendientes ({totalPendientes})
          </button>
          <button
            type="button"
            className={`filtro-tab ${
              filtroEstado === "cotización" ? "active" : ""
            }`}
            onClick={() => setFiltroEstado("cotización")}
          >
            En cotización
          </button>
          <button
            type="button"
            className={`filtro-tab ${
              filtroEstado === "aprobado" ? "active" : ""
            }`}
            onClick={() => setFiltroEstado("aprobado")}
          >
            Aprobados
          </button>
        </div>

        {/* Lista de Pedidos */}
        <div className="pedidos-lista">
          {pedidosFiltrados.length === 0 ? (
            <p className="no-items-msg">No se encontraron pedidos en esta categoría.</p>
          ) : (
            pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} className="pedido-card">
                <div className="pedido-header">
                  <div>
                    <span className="pedido-id">{pedido.id}</span>
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
                    <span
                      className={`badge-estado-pedido ${
                        pedido.estado === "Aprobado"
                          ? "badge-aprobado"
                          : pedido.estado === "Pendiente de aprobación"
                          ? "badge-pendiente"
                          : pedido.estado === "Rechazado"
                          ? "badge-rechazado"
                          : "badge-cotizacion"
                      }`}
                    >
                      {pedido.estado}
                    </span>
                  </div>
                </div>

                <h3 className="pedido-titulo">{pedido.repuestoNombre}</h3>

                <div className="pedido-detalles-grid">
                  <div>
                    <span className="detalle-rotulo">Cantidad solicitada:</span>
                    <span className="detalle-valor">
                      {pedido.cantidad} {pedido.unidad}
                    </span>
                  </div>
                  <div>
                    <span className="detalle-rotulo">Solicitante:</span>
                    <span className="detalle-valor">{pedido.solicitante}</span>
                  </div>
                  <div>
                    <span className="detalle-rotulo">Proveedor sugerido:</span>
                    <span className="detalle-valor">{pedido.proveedor}</span>
                  </div>
                  <div>
                    <span className="detalle-rotulo">Monto estimado:</span>
                    <span className="detalle-valor text-blue">
                      ${pedido.montoEstimado.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                <p className="pedido-justificacion">
                  <strong>Justificación:</strong> {pedido.justificacion}
                </p>

                <div className="pedido-acciones">
                  {pedido.estado === "Pendiente de aprobación" && (
                    <>
                      <button
                        type="button"
                        className="btn-accion btn-aprobar"
                        onClick={() => handleCambiarEstado(pedido.id, "Aprobado")}
                      >
                        ✓ Aprobar Compra
                      </button>
                      <button
                        type="button"
                        className="btn-accion btn-cotizar"
                        onClick={() => handleCambiarEstado(pedido.id, "En cotización")}
                      >
                        Enviar a Cotización
                      </button>
                      <button
                        type="button"
                        className="btn-accion btn-rechazar"
                        onClick={() => handleCambiarEstado(pedido.id, "Rechazado")}
                      >
                        ✕ Rechazar
                      </button>
                    </>
                  )}

                  {pedido.estado === "En cotización" && (
                    <>
                      <button
                        type="button"
                        className="btn-accion btn-aprobar"
                        onClick={() => handleCambiarEstado(pedido.id, "Aprobado")}
                      >
                        ✓ Aprobar Cotización
                      </button>
                      <button
                        type="button"
                        className="btn-accion btn-rechazar"
                        onClick={() => handleCambiarEstado(pedido.id, "Rechazado")}
                      >
                        ✕ Cancelar
                      </button>
                    </>
                  )}

                  {pedido.estado === "Aprobado" && (
                    <button
                      type="button"
                      className="btn-accion btn-recibir"
                      onClick={() => handleCambiarEstado(pedido.id, "Recibido")}
                    >
                       Marcar como Recibido en Planta
                    </button>
                  )}

                  {(pedido.estado === "Recibido" || pedido.estado === "Rechazado") && (
                    <span className="estado-finalizado-label">
                      {pedido.estado === "Recibido"
                        ? "✓ Mercadería ingresada al depósito"
                        : "✕ Solicitud desestimada"}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

