
import { useEffect, useState } from "react";

import {
  obtenerPedidosCompra,
  actualizarEstadoPedido,
  type PedidoCompraAPI,
  type EstadoPedido,
} from "../services/pedidosCompraService";

import "./styles.css";

interface GestionComprasProps {
  onBack?: () => void;
}

type FiltroEstado =
  | "todos"
  | "pendiente"
  | "cotización"
  | "aprobado"
  | "rechazado"
  | "recibido";

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

export default function GestionCompras({
  onBack,
}: GestionComprasProps) {
  const [pedidos, setPedidos] = useState<PedidoCompraAPI[]>([]);
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>("todos");

  const [mensajeFeedback, setMensajeFeedback] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizandoId, setActualizandoId] =
    useState<number | null>(null);

  async function cargarPedidos() {
    const datos = await obtenerPedidosCompra();
    setPedidos(datos);
  }

  useEffect(() => {
    let activo = true;

    async function iniciar() {
      try {
        const datos = await obtenerPedidosCompra();

        if (activo) {
          setPedidos(datos);
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los pedidos."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void iniciar();

    return () => {
      activo = false;
    };
  }, []);

  async function handleCambiarEstado(
    pedido: PedidoCompraAPI,
    nuevoEstado: EstadoPedido
  ) {
    if (actualizandoId !== null) return;

    const requiereConfirmacion =
      nuevoEstado === "Aprobado" ||
      nuevoEstado === "Rechazado";

    if (requiereConfirmacion) {
      const confirmado = window.confirm(
        `¿Confirmás cambiar el pedido ` +
        `${pedido.codigo_pedido} a "${nuevoEstado}"?`
      );

      if (!confirmado) return;
    }

    setError("");
    setMensajeFeedback("");
    setActualizandoId(pedido.id);

    try {
      const actualizado = await actualizarEstadoPedido(
        pedido.id,
        nuevoEstado
      );

      setPedidos((anteriores) =>
        anteriores.map((p) =>
          p.id === actualizado.id ? actualizado : p
        )
      );

      setMensajeFeedback(
        `Pedido ${actualizado.codigo_pedido} actualizado ` +
        `a estado "${actualizado.estado}".`
      );

      try {
        await cargarPedidos();
      } catch (err) {
        console.warn(
          "El estado se guardó, pero no se pudo refrescar el listado:",
          err
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el pedido."
      );

      // Si otro usuario cambió el estado, recuperamos
      // la versión actual de PostgreSQL.
      try {
        await cargarPedidos();
      } catch {
        // Conservamos el mensaje del error original.
      }
    } finally {
      setActualizandoId(null);
    }
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    switch (filtroEstado) {
      case "pendiente":
        return p.estado === "Pendiente de aprobación";
      case "cotización":
        return p.estado === "En cotización";
      case "aprobado":
        return p.estado === "Aprobado";
      case "rechazado":
        return p.estado === "Rechazado";
      case "recibido":
        return p.estado === "Recibido";
      default:
        return true;
    }
  });

  const totalPendientes = pedidos.filter(
    (p) => p.estado === "Pendiente de aprobación"
  ).length;

  const totalUrgentes = pedidos.filter(
    (p) =>
      p.prioridad === "Urgente" &&
      p.estado !== "Recibido" &&
      p.estado !== "Rechazado"
  ).length;

  const montoTotalComprometido = pedidos
    .filter(
      (p) =>
        p.estado === "Aprobado" ||
        p.estado === "En cotización"
    )
    .reduce(
      (acc, curr) => acc + curr.monto_estimado,
      0
    );

  const filtros: {
    valor: FiltroEstado;
    titulo: string;
    cantidad: number;
  }[] = [
    {
      valor: "todos",
      titulo: "Todos",
      cantidad: pedidos.length,
    },
    {
      valor: "pendiente",
      titulo: "Pendientes",
      cantidad: totalPendientes,
    },
    {
      valor: "cotización",
      titulo: "En cotización",
      cantidad: pedidos.filter(
        (p) => p.estado === "En cotización"
      ).length,
    },
    {
      valor: "aprobado",
      titulo: "Aprobados",
      cantidad: pedidos.filter(
        (p) => p.estado === "Aprobado"
      ).length,
    },
    {
      valor: "rechazado",
      titulo: "Rechazados",
      cantidad: pedidos.filter(
        (p) => p.estado === "Rechazado"
      ).length,
    },
    {
      valor: "recibido",
      titulo: "Recibidos",
      cantidad: pedidos.filter(
        (p) => p.estado === "Recibido"
      ).length,
    },
  ];

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
          <p className="subpantalla-descripcion">
            Revisión, aprobación y cotización de requerimientos
            de compra y reposición para planta.
          </p>
        </div>

        {mensajeFeedback && (
          <div
            className="feedback-banner feedback-banner-success"
            role="status"
          >
            <span>✓</span> {mensajeFeedback}
          </div>
        )}

        {error && (
          <div className="alerta-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        {cargando && (
          <p className="no-items-msg">
            Cargando pedidos de compra...
          </p>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">
              Pendientes Aprobación
            </span>
            <strong className="kpi-value text-amber">
              {totalPendientes}
            </strong>
            <span className="kpi-desc">
              Requieren tu visto bueno
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">
              Urgencias Activas
            </span>
            <strong className="kpi-value text-red">
              {totalUrgentes}
            </strong>
            <span className="kpi-desc">
              Pedidos urgentes sin finalizar
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">
              Monto en Curso
            </span>
            <strong className="kpi-value text-blue">
              ${montoTotalComprometido.toLocaleString("es-AR")}
            </strong>
            <span className="kpi-desc">
              Importes estimados cargados
            </span>
          </div>
        </div>

        <div className="filtro-tabs">
          {filtros.map((filtro) => (
            <button
              key={filtro.valor}
              type="button"
              className={`filtro-tab ${
                filtroEstado === filtro.valor
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setFiltroEstado(filtro.valor)
              }
            >
              {filtro.titulo} ({filtro.cantidad})
            </button>
          ))}
        </div>

        {!cargando && (
          <div className="pedidos-lista">
            {pedidosFiltrados.length === 0 ? (
              <p className="no-items-msg">
                No se encontraron pedidos en esta categoría.
              </p>
            ) : (
              pedidosFiltrados.map((pedido) => {
                const procesando =
                  actualizandoId === pedido.id;

                return (
                  <div
                    key={pedido.id}
                    className="pedido-card"
                  >
                    <div className="pedido-header">
                      <div>
                        <span className="pedido-id">
                          {pedido.codigo_pedido}
                        </span>

                        <span className="pedido-sku">
                          {pedido.codigo}
                        </span>
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
                              : pedido.estado ===
                                "Pendiente de aprobación"
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
                      {pedido.repuesto_nombre}
                    </h3>

                    <div className="pedido-detalles-grid">
                      <div>
                        <span className="detalle-rotulo">
                          Cantidad solicitada:
                        </span>
                        <span className="detalle-valor">
                          {pedido.cantidad} {pedido.unidad}
                        </span>
                      </div>

                      <div>
                        <span className="detalle-rotulo">
                          Solicitante:
                        </span>
                        <span className="detalle-valor">
                          {pedido.solicitante}
                        </span>
                      </div>

                      <div>
                        <span className="detalle-rotulo">
                          Proveedor sugerido:
                        </span>
                        <span className="detalle-valor">
                          {pedido.proveedor || "Sin definir"}
                        </span>
                      </div>

                      <div>
                        <span className="detalle-rotulo">
                          Monto estimado:
                        </span>
                        <span className="detalle-valor text-blue">
                          {pedido.monto_estimado > 0
                            ? `$${pedido.monto_estimado.toLocaleString("es-AR")}`
                            : "Pendiente de cotización"}
                        </span>
                      </div>

                      <div>
                        <span className="detalle-rotulo">
                          Fecha de solicitud:
                        </span>
                        <span className="detalle-valor">
                          {formatearFecha(pedido.fecha)}
                        </span>
                      </div>
                    </div>

                    <p className="pedido-justificacion">
                      <strong>Justificación:</strong>{" "}
                      {pedido.justificacion}
                    </p>

                    <div className="pedido-acciones">
                      {pedido.estado ===
                        "Pendiente de aprobación" && (
                        <>
                          <button
                            type="button"
                            className="btn-accion btn-aprobar"
                            disabled={actualizandoId !== null}
                            onClick={() =>
                              handleCambiarEstado(
                                pedido,
                                "Aprobado"
                              )
                            }
                          >
                            {procesando
                              ? "Procesando..."
                              : "✓ Aprobar Compra"}
                          </button>

                          <button
                            type="button"
                            className="btn-accion btn-cotizar"
                            disabled={actualizandoId !== null}
                            onClick={() =>
                              handleCambiarEstado(
                                pedido,
                                "En cotización"
                              )
                            }
                          >
                            Enviar a Cotización
                          </button>

                          <button
                            type="button"
                            className="btn-accion btn-rechazar"
                            disabled={actualizandoId !== null}
                            onClick={() =>
                              handleCambiarEstado(
                                pedido,
                                "Rechazado"
                              )
                            }
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
                            disabled={actualizandoId !== null}
                            onClick={() =>
                              handleCambiarEstado(
                                pedido,
                                "Aprobado"
                              )
                            }
                          >
                            {procesando
                              ? "Procesando..."
                              : "✓ Aprobar Cotización"}
                          </button>

                          <button
                            type="button"
                            className="btn-accion btn-rechazar"
                            disabled={actualizandoId !== null}
                            onClick={() =>
                              handleCambiarEstado(
                                pedido,
                                "Rechazado"
                              )
                            }
                          >
                            ✕ Cancelar
                          </button>
                        </>
                      )}

                      {pedido.estado === "Aprobado" && (
                        <span className="estado-finalizado-label">
                          ✓ Compra aprobada. Pendiente de
                          registrar recepción en depósito.
                        </span>
                      )}

                      {pedido.estado === "Recibido" && (
                        <span className="estado-finalizado-label">
                          ✓ Pedido marcado como recibido
                        </span>
                      )}

                      {pedido.estado === "Rechazado" && (
                        <span className="estado-finalizado-label">
                          ✕ Solicitud desestimada
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


