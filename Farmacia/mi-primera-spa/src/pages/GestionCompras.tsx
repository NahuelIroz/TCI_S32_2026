
import { useEffect, useState } from "react";

import {
  obtenerPedidosCompra,
  actualizarEstadoPedido,
  actualizarCotizacionPedido,
  obtenerRecepcionesCompra,
  type RecepcionCompraAPI,
  type PedidoCompraAPI,
  type EstadoPedido,
} from "../services/pedidosCompraService";

import "./styles.css";

interface GestionComprasProps {
  onBack?: () => void;
  rolUsuario: "MANTENIMIENTO" | "ENCARGADO" | "OPERARIO" | "GERENCIA";
}

type FiltroEstado =
  | "todos"
  | "pendiente"
  | "cotización"
  | "aprobado"
  | "rechazado"
  | "recibido";

function tieneCotizacion(pedido: PedidoCompraAPI): boolean {
  return (
    (pedido.proveedor || "").trim().length > 0 &&
    Number.isFinite(pedido.monto_estimado) &&
    pedido.monto_estimado > 0
  );
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

export default function GestionCompras({
  onBack,
  rolUsuario,
}: GestionComprasProps) {
  const puedeCotizar = rolUsuario === "MANTENIMIENTO";
  const puedeDecidir = rolUsuario === "ENCARGADO";
  const [historial, setHistorial] = useState<Record<number, RecepcionCompraAPI[]>>({});
  const [historialAbierto, setHistorialAbierto] = useState<number | null>(null);
  const [historialCargando, setHistorialCargando] = useState(false);
  const [historialError, setHistorialError] = useState("");

  async function alternarHistorial(pedidoId: number) {
    if (historialAbierto === pedidoId) {
      setHistorialAbierto(null);
      return;
    }
    setHistorialAbierto(pedidoId);
    setHistorialError("");
    setHistorialCargando(true);
    try {
      const recepciones = await obtenerRecepcionesCompra(pedidoId);
      setHistorial((anterior) => ({ ...anterior, [pedidoId]: recepciones }));
    } catch (err) {
      setHistorialError(err instanceof Error ? err.message : "No se pudo consultar el historial.");
    } finally {
      setHistorialCargando(false);
    }
  }

  const [pedidos, setPedidos] = useState<PedidoCompraAPI[]>([]);
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>("todos");

  const [mensajeFeedback, setMensajeFeedback] = useState("");
  const [error, setError] = useState("");

  const [cargando, setCargando] = useState(true);
  const [actualizandoId, setActualizandoId] =
    useState<number | null>(null);

  // Formulario de cotización
  const [pedidoEditandoId, setPedidoEditandoId] =
    useState<number | null>(null);

  const [proveedor, setProveedor] = useState("");
  const [montoEstimado, setMontoEstimado] = useState("");

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

  function abrirFormularioCotizacion(pedido: PedidoCompraAPI) {
    setPedidoEditandoId(pedido.id);
    setProveedor(pedido.proveedor || "");
    setMontoEstimado(
      pedido.monto_estimado > 0
        ? String(pedido.monto_estimado)
        : ""
    );
    setError("");
    setMensajeFeedback("");
  }

  function cerrarFormularioCotizacion() {
    setPedidoEditandoId(null);
    setProveedor("");
    setMontoEstimado("");
  }

  async function guardarCotizacion(pedido: PedidoCompraAPI) {
    if (!puedeCotizar || pedido.estado !== "En cotización" || actualizandoId !== null) return;

    const proveedorLimpio = proveedor.trim();
    const monto = Number(montoEstimado);

    if (!proveedorLimpio) {
      setError("Ingresá el nombre del proveedor.");
      return;
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      setError("El monto estimado debe ser mayor a cero.");
      return;
    }

    setError("");
    setMensajeFeedback("");
    setActualizandoId(pedido.id);

    try {
      const actualizado = await actualizarCotizacionPedido(
        pedido.id,
        {
          proveedor: proveedorLimpio,
          monto_estimado: monto,
        }
      );

      setPedidos((anteriores) =>
        anteriores.map((p) =>
          p.id === actualizado.id ? actualizado : p
        )
      );

      cerrarFormularioCotizacion();

      setMensajeFeedback(
        `Cotización del pedido ${actualizado.codigo_pedido} ` +
        `guardada correctamente. Queda disponible para revisión del encargado.`
      );

      try {
        await cargarPedidos();
      } catch (err) {
        console.warn(
          "La cotización se guardó, pero no se pudo refrescar el listado:",
          err
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la cotización."
      );
    } finally {
      setActualizandoId(null);
    }
  }

  async function handleCambiarEstado(
    pedido: PedidoCompraAPI,
    nuevoEstado: EstadoPedido
  ) {
    if (!puedeDecidir || actualizandoId !== null) return;

    if (
      nuevoEstado === "Aprobado" &&
      !tieneCotizacion(pedido)
    ) {
      setError(
        `El pedido ${pedido.codigo_pedido} necesita ` +
        `una cotización antes de ser aprobado.`
      );
      return;
    }

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

      if (pedidoEditandoId === pedido.id) {
        cerrarFormularioCotizacion();
      }

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

      try {
        await cargarPedidos();
      } catch {
        // Conservamos el error original.
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
            Revisión, cotización y aprobación de requerimientos
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
              {puedeDecidir ? "Requieren tu visto bueno" : "A la espera del encargado"}
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
              Cotizaciones y compras aprobadas
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
              onClick={() => setFiltroEstado(filtro.valor)}
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

                const editando =
                  pedidoEditandoId === pedido.id;

                const cotizacionRegistrada =
                  tieneCotizacion(pedido);

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
                          Proveedor:
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

                    {/* FORMULARIO DE COTIZACIÓN */}
                    {puedeCotizar && pedido.estado === "En cotización" &&
                      editando && (
                        <form
                          className="formulario-sub-limpio"
                          onSubmit={(e) => {
                            e.preventDefault();
                            void guardarCotizacion(pedido);
                          }}
                          style={{ marginTop: "16px" }}
                        >
                          <h4>Registrar cotización</h4>

                          <div className="campo">
                            <label
                              htmlFor={`proveedor-${pedido.id}`}
                            >
                              Proveedor
                            </label>

                            <input
                              id={`proveedor-${pedido.id}`}
                              className="input-formulario"
                              type="text"
                              value={proveedor}
                              maxLength={200}
                              disabled={procesando}
                              onChange={(e) =>
                                setProveedor(e.target.value)
                              }
                              placeholder="Nombre del proveedor"
                              required
                            />
                          </div>

                          <div className="campo">
                            <label
                              htmlFor={`monto-${pedido.id}`}
                            >
                              Monto estimado ($)
                            </label>

                            <input
                              id={`monto-${pedido.id}`}
                              className="input-formulario"
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={montoEstimado}
                              disabled={procesando}
                              onChange={(e) =>
                                setMontoEstimado(e.target.value)
                              }
                              placeholder="Ejemplo: 45000"
                              required
                            />
                          </div>

                          <div className="pedido-acciones">
                            <button
                              type="submit"
                              className="btn-accion btn-aprobar"
                              disabled={actualizandoId !== null}
                            >
                              {procesando
                                ? "Guardando..."
                                : "✓ Guardar Cotización"}
                            </button>

                            <button
                              type="button"
                              className="btn-accion btn-rechazar"
                              disabled={actualizandoId !== null}
                              onClick={cerrarFormularioCotizacion}
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}

                    {/* ACCIONES DEL PEDIDO SEGÚN ROL */}
                    <div className="pedido-acciones">
                      {puedeDecidir && pedido.estado === "Pendiente de aprobación" && (
                        <>
                          <button type="button" className="btn-accion btn-cotizar"
                            disabled={actualizandoId !== null}
                            onClick={() => void handleCambiarEstado(pedido, "En cotización")}>
                            Enviar a Cotización
                          </button>
                          <button type="button" className="btn-accion btn-rechazar"
                            disabled={actualizandoId !== null}
                            onClick={() => void handleCambiarEstado(pedido, "Rechazado")}>
                            ✕ Rechazar
                          </button>
                        </>
                      )}
                      {puedeCotizar && pedido.estado === "En cotización" && !editando && (
                        <button type="button" className="btn-accion btn-cotizar"
                          disabled={actualizandoId !== null}
                          onClick={() => abrirFormularioCotizacion(pedido)}>
                          {cotizacionRegistrada ? "Editar Cotización" : "Registrar Cotización"}
                        </button>
                      )}
                      {puedeDecidir && pedido.estado === "En cotización" && (
                        <>
                          {cotizacionRegistrada && (
                            <button type="button" className="btn-accion btn-aprobar"
                              disabled={actualizandoId !== null}
                              onClick={() => void handleCambiarEstado(pedido, "Aprobado")}>
                              ✓ Aprobar Cotización
                            </button>
                          )}
                          <button type="button" className="btn-accion btn-rechazar"
                            disabled={actualizandoId !== null}
                            onClick={() => void handleCambiarEstado(pedido, "Rechazado")}>
                            ✕ Rechazar Pedido
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
                    {(pedido.estado === "Aprobado" || pedido.estado === "Recibido") && (
                      <div style={{ marginTop: 16 }}>
                        <button type="button" className="btn-accion btn-cotizar"
                          onClick={() => void alternarHistorial(pedido.id)}>
                          {historialAbierto === pedido.id ? "Ocultar recepciones" : "Ver historial de recepciones"}
                        </button>
                        {historialAbierto === pedido.id && (
                          <div style={{ marginTop: 12 }}>
                            {historialCargando && <p>Cargando recepciones...</p>}
                            {historialError && <p className="alerta-error">{historialError}</p>}
                            {!historialCargando && !historialError && (() => {
                              const recepciones = historial[pedido.id] ?? [];
                              const recibido = recepciones.reduce((total, mov) => total + mov.cantidad, 0);
                              return (
                                <>
                                  <p><strong>Solicitado:</strong> {pedido.cantidad} {pedido.unidad} · <strong>Recibido:</strong> {recibido} · <strong>Pendiente:</strong> {Math.max(0, pedido.cantidad - recibido)}</p>
                                  {recepciones.length === 0 ? (
                                    <p>No hay recepciones registradas para este pedido.</p>
                                  ) : (
                                    <div className="pedido-detalles-grid">
                                      {recepciones.map((mov) => (
                                        <div key={mov.id}>
                                          <strong>Remito: {mov.remito || "Sin remito"}</strong>
                                          <p>Fecha: {formatearFecha(mov.fecha)}</p>
                                          <p>Cantidad: +{mov.cantidad} {pedido.unidad}</p>
                                          <p>Proveedor: {mov.proveedor || "Sin definir"}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
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



