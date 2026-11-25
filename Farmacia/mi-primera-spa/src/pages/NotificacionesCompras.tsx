import { useState, useEffect } from "react";
import {
  obtenerPedidosCompra,
  decisionGerenciaPedido,
  aprobarTodosPendientesGerencia,
  marcarNotificacionPedidoLeida,
  marcarTodasNotificacionesPedidosLeidas,
  type PedidoCompraAPI,
} from "../services/pedidosCompraService";
import "./styles.css";

interface NotificacionesComprasProps {
  onBack?: () => void;
}

function formatearFecha(fecha: string): string {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }
  return valor.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function NotificacionesCompras({
  onBack,
}: NotificacionesComprasProps) {
  const [pedidos, setPedidos] = useState<PedidoCompraAPI[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [filtro, setFiltro] = useState<"todos" | "pendientes" | "aprobados" | "urgentes">("todos");
  const [mensajeFeedback, setMensajeFeedback] = useState<string>("");

  useEffect(() => {
    let montado = true;

    async function cargar() {
      try {
        setCargando(true);
        setError("");
        const data = await obtenerPedidosCompra();
        if (montado) {
          setPedidos(data);
        }
      } catch (err) {
        if (montado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las solicitudes de compra."
          );
        }
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    }

    void cargar();

    return () => {
      montado = false;
    };
  }, []);

  const handleAprobarCompra = async (pedido: PedidoCompraAPI) => {
    try {
      setProcesandoId(pedido.id);
      setError("");
      const actualizado = await decisionGerenciaPedido(pedido.id, "Aprobado");
      setPedidos((prev) =>
        prev.map((p) => (p.id === actualizado.id ? actualizado : p))
      );
      setMensajeFeedback(
        `✓ Compra ${actualizado.codigo_pedido} (${actualizado.repuesto_nombre}) APROBADA exitosamente por Gerencia.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo aprobar la compra."
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const handleRechazarCompra = async (pedido: PedidoCompraAPI) => {
    try {
      setProcesandoId(pedido.id);
      setError("");
      const actualizado = await decisionGerenciaPedido(pedido.id, "Rechazado");
      setPedidos((prev) =>
        prev.map((p) => (p.id === actualizado.id ? actualizado : p))
      );
      setMensajeFeedback(
        `✕ Compra ${actualizado.codigo_pedido} (${actualizado.repuesto_nombre}) rechazada.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo rechazar la compra."
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const handleAprobarTodasPendientes = async () => {
    const pendientes = pedidos.filter(
      (p) => p.estado === "Pendiente de aprobación" || p.estado === "En cotización"
    );
    if (pendientes.length === 0) return;

    try {
      setError("");
      const actualizados = await aprobarTodosPendientesGerencia();
      setPedidos(actualizados);
      setMensajeFeedback(
        `✓ Se autorizaron y aprobaron ${pendientes.length} solicitudes de compra pendientes.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron aprobar las compras pendientes."
      );
    }
  };

  const handleMarcarLeida = async (pedido: PedidoCompraAPI) => {
    try {
      setProcesandoId(pedido.id);
      setError("");
      const actualizado = await marcarNotificacionPedidoLeida(pedido.id, true);
      setPedidos((prev) =>
        prev.map((p) => (p.id === actualizado.id ? actualizado : p))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo marcar la notificación."
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      setError("");
      const actualizados = await marcarTodasNotificacionesPedidosLeidas();
      setPedidos(actualizados);
      setMensajeFeedback("✓ Todas las notificaciones fueron marcadas como leídas.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron marcar las notificaciones."
      );
    }
  };

  const noLeidas = pedidos.filter((p) => !p.notificacion_leida).length;
  const totalPendientes = pedidos.filter(
    (p) => p.estado === "Pendiente de aprobación" || p.estado === "En cotización"
  ).length;
  const totalAprobados = pedidos.filter((p) => p.estado === "Aprobado").length;
  const totalUrgentes = pedidos.filter(
    (p) => p.prioridad === "Urgente" && p.estado !== "Recibido" && p.estado !== "Rechazado"
  ).length;

  const montoTotalPendiente = pedidos
    .filter((p) => p.estado === "Pendiente de aprobación" || p.estado === "En cotización")
    .reduce((acc, curr) => acc + curr.monto_estimado, 0);

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === "pendientes") return p.estado === "Pendiente de aprobación" || p.estado === "En cotización";
    if (filtro === "aprobados") return p.estado === "Aprobado";
    if (filtro === "urgentes") return p.prioridad === "Urgente";
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
        <h1>Aprobación de Compras de Repuestos</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado-con-accion">
          <div>
            <p className="subpantalla-descripcion">
              Canal gerencial para evaluar, aprobar o rechazar solicitudes de compra e insumos críticos para mantenimiento.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {totalPendientes > 0 && (
              <button
                type="button"
                className="btn-nueva-incidencia"
                onClick={() => void handleAprobarTodasPendientes()}
                style={{ background: "#16a34a" }}
              >
                ✓ Aprobar pendientes (${montoTotalPendiente.toLocaleString("es-AR")})
              </button>
            )}
            {noLeidas > 0 && (
              <button
                type="button"
                className="btn-nueva-incidencia"
                onClick={() => void handleMarcarTodasLeidas()}
              >
                ✓ Marcar leídas ({noLeidas})
              </button>
            )}
          </div>
        </div>

        {mensajeFeedback && (
          <div className="feedback-banner feedback-banner-success" role="status">
            <span>✓</span> {mensajeFeedback}
          </div>
        )}

        {error && (
          <div className="alerta-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Pendientes de Aprobación</span>
            <strong className="kpi-value text-amber">{totalPendientes}</strong>
            <span className="kpi-desc">Requieren visto bueno</span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Monto por Autorizar</span>
            <strong className="kpi-value text-blue">
              ${montoTotalPendiente.toLocaleString("es-AR")}
            </strong>
            <span className="kpi-desc">Impacto presupuestario en curso</span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Urgencias Activas</span>
            <strong className="kpi-value text-red">{totalUrgentes}</strong>
            <span className="kpi-desc">Repuestos con quiebre de stock</span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Compras Aprobadas</span>
            <strong className="kpi-value text-purple">{totalAprobados}</strong>
            <span className="kpi-desc">Autorizadas este período</span>
          </div>
        </div>

        <div className="filtro-tabs">
          <button
            type="button"
            className={`filtro-tab ${filtro === "todos" ? "active" : ""}`}
            onClick={() => setFiltro("todos")}
          >
            Todos ({pedidos.length})
          </button>
          <button
            type="button"
            className={`filtro-tab ${filtro === "pendientes" ? "active" : ""}`}
            onClick={() => setFiltro("pendientes")}
          >
            Por Aprobar ({totalPendientes})
          </button>
          <button
            type="button"
            className={`filtro-tab ${filtro === "aprobados" ? "active" : ""}`}
            onClick={() => setFiltro("aprobados")}
          >
            Aprobados ({totalAprobados})
          </button>
          <button
            type="button"
            className={`filtro-tab ${filtro === "urgentes" ? "active" : ""}`}
            onClick={() => setFiltro("urgentes")}
          >
            Urgentes ({totalUrgentes})
          </button>
        </div>

        {cargando ? (
          <p className="no-items-msg">Cargando solicitudes de compra...</p>
        ) : (
          <div className="pedidos-lista">
            {pedidosFiltrados.length === 0 ? (
              <p className="no-items-msg">No hay órdenes en esta categoría.</p>
            ) : (
              pedidosFiltrados.map((pedido) => {
                const procesando = procesandoId === pedido.id;
                return (
                  <div
                    key={pedido.id}
                    className={`pedido-card ${
                      !pedido.notificacion_leida ? "notificacion-no-leida" : ""
                    }`}
                  >
                    <div className="pedido-header">
                      <div>
                        <span className="pedido-id">{pedido.codigo_pedido}</span>
                        {!pedido.notificacion_leida && (
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

                    <h3 className="pedido-titulo">
                      Solicitud de reposición: {pedido.repuesto_nombre}
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
                          ${pedido.monto_estimado.toLocaleString("es-AR")}
                        </span>
                      </div>
                      <div>
                        <span className="detalle-rotulo">Solicitante:</span>
                        <span className="detalle-valor">{pedido.solicitante}</span>
                      </div>
                      <div>
                        <span className="detalle-rotulo">Proveedor sugerido:</span>
                        <span className="detalle-valor">
                          {pedido.proveedor || "Sin definir"}
                        </span>
                      </div>
                      <div>
                        <span className="detalle-rotulo">Fecha de emisión:</span>
                        <span className="detalle-valor">
                          {formatearFecha(pedido.fecha)}
                        </span>
                      </div>
                    </div>

                    <div className="pedido-acciones">
                      {pedido.estado === "Pendiente de aprobación" && (
                        <>
                          <button
                            type="button"
                            className="btn-accion btn-aprobar"
                            disabled={procesando}
                            onClick={() => void handleAprobarCompra(pedido)}
                          >
                            ✓ Aprobar Compra
                          </button>
                          <button
                            type="button"
                            className="btn-accion btn-rechazar"
                            disabled={procesando}
                            onClick={() => void handleRechazarCompra(pedido)}
                          >
                            ✕ Rechazar
                          </button>
                          {!pedido.notificacion_leida && (
                            <button
                              type="button"
                              className="btn-accion btn-cotizar"
                              disabled={procesando}
                              onClick={() => void handleMarcarLeida(pedido)}
                            >
                              Marcar como leída
                            </button>
                          )}
                        </>
                      )}

                      {pedido.estado === "En cotización" && (
                        <>
                          <button
                            type="button"
                            className="btn-accion btn-aprobar"
                            disabled={procesando}
                            onClick={() => void handleAprobarCompra(pedido)}
                          >
                            ✓ Autorizar Cotización
                          </button>
                          <button
                            type="button"
                            className="btn-accion btn-rechazar"
                            disabled={procesando}
                            onClick={() => void handleRechazarCompra(pedido)}
                          >
                            ✕ Cancelar
                          </button>
                        </>
                      )}

                      {pedido.estado === "Aprobado" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", justifyContent: "space-between" }}>
                          <span className="estado-finalizado-label" style={{ color: "#16a34a", fontWeight: 700 }}>
                            ✓ Compra aprobada por Gerencia (Lista para emitir orden)
                          </span>
                          <button
                            type="button"
                            className="btn-accion btn-rechazar"
                            disabled={procesando}
                            onClick={() => void handleRechazarCompra(pedido)}
                          >
                            Revocar
                          </button>
                        </div>
                      )}

                      {pedido.estado === "Rechazado" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", justifyContent: "space-between" }}>
                          <span className="estado-finalizado-label" style={{ color: "#dc2626" }}>
                            ✕ Solicitud rechazada por Gerencia
                          </span>
                          <button
                            type="button"
                            className="btn-accion btn-aprobar"
                            disabled={procesando}
                            onClick={() => void handleAprobarCompra(pedido)}
                          >
                            Reconsiderar y Aprobar
                          </button>
                        </div>
                      )}

                      {pedido.estado === "Recibido" && (
                        <span className="estado-finalizado-label">
                          ✓ Mercadería ingresada al depósito
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
