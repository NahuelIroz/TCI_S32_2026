
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Repuesto } from "../data/repuestos";
import {
  obtenerRepuestos,
} from "../services/repuestosService";

import {
  obtenerPedidosCompra,
  crearPedidoCompra,
  type PedidoCompraAPI,
  type PrioridadPedido,
} from "../services/pedidosCompraService";

import { servicioNotificaciones } from "../services/notificacionesService";
import "./styles.css";

interface PedidosCompraProps {
  onBack?: () => void;
  repuestoInicial?: Repuesto;
}

const SOLICITANTE_ACTUAL = "Carlos Gómez (Mantenimiento)";

function calcularCantidadSugerida(repuesto: Repuesto): number {
  return Math.max(
    repuesto.minimo * 2 - repuesto.disponible,
    5
  );
}

function calcularPrioridadSugerida(
  repuesto: Repuesto
): PrioridadPedido {
  return repuesto.disponible === 0 ? "Urgente" : "Media";
}

function generarJustificacion(repuesto: Repuesto): string {
  return (
    `Faltante detectado (RN-03): stock actual de ` +
    `${repuesto.disponible} ${repuesto.unidad} ` +
    `(mínimo de seguridad: ${repuesto.minimo} ${repuesto.unidad}).`
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

export default function PedidosCompra({
  onBack,
  repuestoInicial,
}: PedidosCompraProps) {
  const [listaRepuestos, setListaRepuestos] = useState<Repuesto[]>([]);
  const [pedidos, setPedidos] = useState<PedidoCompraAPI[]>([]);

  const [repuestoId, setRepuestoId] = useState<number | null>(
    repuestoInicial?.id ?? null
  );

  const [cantidad, setCantidad] = useState<number>(
    repuestoInicial
      ? calcularCantidadSugerida(repuestoInicial)
      : 10
  );

  const [prioridad, setPrioridad] = useState<PrioridadPedido>(
    repuestoInicial
      ? calcularPrioridadSugerida(repuestoInicial)
      : "Media"
  );

  const [justificacion, setJustificacion] = useState<string>(
    repuestoInicial
      ? generarJustificacion(repuestoInicial)
      : "Stock por debajo del mínimo de seguridad para mantenimiento preventivo."
  );

  const [mensajeExito, setMensajeExito] = useState("");
  const [error, setError] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const repuestosCriticos = listaRepuestos.filter(
    (r) => r.disponible <= r.minimo
  );

  const repuestoActual = listaRepuestos.find(
    (r) => r.id === repuestoId
  );

  function seleccionarRepuesto(repuesto: Repuesto) {
    setRepuestoId(repuesto.id);
    setCantidad(calcularCantidadSugerida(repuesto));
    setPrioridad(calcularPrioridadSugerida(repuesto));
    setJustificacion(generarJustificacion(repuesto));

    setMensajeExito("");
    setError("");
  }

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        setCargando(true);
        setError("");

        const [repuestosDB, pedidosDB] = await Promise.all([
          obtenerRepuestos(),
          obtenerPedidosCompra(),
        ]);

        if (!activo) return;

        setListaRepuestos(repuestosDB);
        setPedidos(pedidosDB);

        const seleccionado =
          repuestosDB.find(
            (r) => r.id === repuestoInicial?.id
          ) ??
          repuestosDB.find(
            (r) => r.disponible <= r.minimo
          ) ??
          repuestosDB[0];

        if (seleccionado) {
          setRepuestoId(seleccionado.id);
          setCantidad(calcularCantidadSugerida(seleccionado));
          setPrioridad(calcularPrioridadSugerida(seleccionado));
          setJustificacion(generarJustificacion(seleccionado));
        } else {
          setRepuestoId(null);
        }
      } catch (err) {
        if (!activo) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los pedidos de compra."
        );
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarDatos();

    return () => {
      activo = false;
    };
  }, [repuestoInicial?.id]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (guardando) return;

    setError("");
    setMensajeExito("");

    if (!repuestoActual) {
      setError("Seleccioná un repuesto válido.");
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setError(
        "La cantidad solicitada debe ser un número entero mayor a cero."
      );
      return;
    }

    if (!justificacion.trim()) {
      setError("Ingresá una justificación técnica.");
      return;
    }

    setGuardando(true);

    try {
      const nuevoPedido = await crearPedidoCompra({
        repuesto_id: repuestoActual.id,
        cantidad,
        prioridad,
        justificacion: justificacion.trim(),
        solicitante: SOLICITANTE_ACTUAL,

        // Estos datos se completarán durante la cotización.
        monto_estimado: 0,
        proveedor: "",
      });

      // El pedido ya quedó confirmado en PostgreSQL.
      setPedidos((anteriores) => [
        nuevoPedido,
        ...anteriores.filter((p) => p.id !== nuevoPedido.id),
      ]);

      setMensajeExito(
        `✓ Pedido ${nuevoPedido.codigo_pedido} generado ` +
        `exitosamente con prioridad "${nuevoPedido.prioridad}". ` +
        `Estado: ${nuevoPedido.estado}.`
      );

      // Conservamos el sistema de notificaciones existente.
      // Una falla de notificación no debe invalidar el pedido.
      try {
        servicioNotificaciones.enviarNotificacion(
          "solicitud_compra",
          `🚨 PEDIDO RN-04 [${prioridad.toUpperCase()}]: ` +
          `Compra solicitada para ${repuestoActual.nombre}`,
          [
            "encargado.manana@planta.farmacia.com",
            "encargado.tarde@planta.farmacia.com",
            "encargado.noche@planta.farmacia.com",
            "gerencia@planta.farmacia.com",
          ],
          `Se generó ${nuevoPedido.codigo_pedido} para ` +
          `${cantidad} ${repuestoActual.unidad} de ` +
          `${repuestoActual.nombre}, con prioridad ${prioridad}. ` +
          `Justificación: ${justificacion.trim()}`
        );
      } catch (errorNotificacion) {
        console.warn(
          "El pedido se guardó, pero falló la notificación:",
          errorNotificacion
        );
      }

      // Actualizamos el listado desde PostgreSQL.
      try {
        const pedidosActualizados = await obtenerPedidosCompra();
        setPedidos(pedidosActualizados);
      } catch (errorActualizacion) {
        console.warn(
          "No se pudo refrescar el historial:",
          errorActualizacion
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `No se pudo crear el pedido: ${err.message}`
          : "No se pudo crear el pedido de compra."
      );
    } finally {
      setGuardando(false);
    }
  }

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

        <h1>Reportar faltantes y compras</h1>
      </header>

      <div className="incidencia-form">
        <div className="subpantalla-encabezado">
          <p className="subpantalla-descripcion">
            Reportá faltantes y generá pedidos de compra.
            Las solicitudes se registran en PostgreSQL con
            su grado de urgencia para su posterior aprobación.
          </p>
        </div>

        {cargando && (
          <p className="no-items-msg">
            Cargando repuestos y pedidos de compra...
          </p>
        )}

        {error && (
          <div className="alerta-error" role="alert">
            <p>⚠️ {error}</p>
          </div>
        )}

        {mensajeExito && (
          <div className="alerta-exito" role="status">
            <strong>{mensajeExito}</strong>
          </div>
        )}

        {!cargando && repuestosCriticos.length > 0 && (
          <div className="compras-criticos-box">
            <strong className="compras-criticos-titulo">
              ⚠️ Repuestos con stock bajo o agotado
            </strong>

            <div className="compras-criticos-lista">
              {repuestosCriticos.map((rep) => (
                <div
                  key={rep.id}
                  className="compras-critico-item"
                >
                  <div>
                    <strong>{rep.codigo}</strong>: {rep.nombre}{" "}

                    <span
                      className={`stock-critico-alerta ${
                        rep.disponible === 0
                          ? "agotado"
                          : "bajo"
                      }`}
                    >
                      ({rep.disponible} de {rep.minimo}{" "}
                      {rep.unidad})
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-pedir-rapido"
                    disabled={guardando}
                    onClick={() => seleccionarRepuesto(rep)}
                  >
                    + Pedir compra
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!cargando && repuestosCriticos.length === 0 && (
          <p className="subpantalla-descripcion">
            No hay repuestos con stock bajo o agotado.
            Podés generar una solicitud de reposición programada.
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="formulario-sub-limpio"
        >
          <div className="campo">
            <label htmlFor="repuesto-compra">
              Repuesto a solicitar
            </label>

            <select
              id="repuesto-compra"
              className="input-formulario"
              value={repuestoId ?? ""}
              disabled={cargando || guardando}
              onChange={(e) => {
                const seleccionado = listaRepuestos.find(
                  (r) => r.id === Number(e.target.value)
                );

                if (seleccionado) {
                  seleccionarRepuesto(seleccionado);
                }
              }}
              required
            >
              {listaRepuestos.length === 0 && (
                <option value="">
                  No hay repuestos disponibles
                </option>
              )}

              {listaRepuestos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.codigo} - {r.nombre}{" "}
                  (Stock actual: {r.disponible} {r.unidad} |
                  Mínimo: {r.minimo} {r.unidad})
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="cantidad-compra">
              Cantidad requerida
            </label>

            <input
              id="cantidad-compra"
              type="number"
              min={1}
              step={1}
              className="input-formulario"
              value={cantidad}
              disabled={cargando || guardando}
              onChange={(e) => setCantidad(Number(e.target.value))}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="prioridad-compra">
              Grado de urgencia
            </label>

            <select
              id="prioridad-compra"
              className="input-formulario"
              value={prioridad}
              disabled={cargando || guardando}
              onChange={(e) =>
                setPrioridad(e.target.value as PrioridadPedido)
              }
            >
              <option value="Urgente">
                🚨 Urgente (Máquina detenida o riesgo inminente de parada)
              </option>
              <option value="Media">
                ⚠️ Normal / Media (Stock bajo próximo a quebrar)
              </option>
              <option value="Baja">
                🟢 Baja (Reposición programada estándar)
              </option>
            </select>

            <small className="campo-ayuda">
              La solicitud quedará pendiente de aprobación.
              Se generará una notificación mediante el sistema actual.
            </small>
          </div>

          <div className="campo">
            <label htmlFor="justificacion-compra">
              Justificación técnica del pedido
            </label>

            <textarea
              id="justificacion-compra"
              value={justificacion}
              disabled={cargando || guardando}
              maxLength={1000}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Detallá por qué se solicita este material y para qué equipos..."
              required
            />
          </div>

          <button
            type="submit"
            className="boton-enviar"
            disabled={
              cargando ||
              guardando ||
              !repuestoActual
            }
          >
            {guardando
              ? "Registrando pedido..."
              : "Enviar Pedido de Compra"}
          </button>
        </form>

        <div className="historial-pedidos-seccion">
          <h3 className="historial-pedidos-titulo">
            Pedidos de compra registrados
          </h3>

          {!cargando && pedidos.length === 0 && (
            <p className="no-items-msg">
              Todavía no hay pedidos de compra registrados.
            </p>
          )}

          <div className="pedidos-lista">
            {pedidos.slice(0, 3).map((p) => (
              <div key={p.id} className="pedido-card">
                <div className="pedido-header">
                  <div>
                    <span className="pedido-id">
                      {p.codigo_pedido}
                    </span>

                    <span className="pedido-sku">
                      {p.codigo}
                    </span>
                  </div>

                  <div className="pedido-badges">
                    <span
                      className={`badge-prioridad ${
                        p.prioridad === "Urgente"
                          ? "badge-urgente"
                          : p.prioridad === "Media"
                          ? "badge-media"
                          : "badge-baja"
                      }`}
                    >
                      {p.prioridad}
                    </span>

                    <span className="badge-estado-pedido badge-cotizacion">
                      {p.estado}
                    </span>
                  </div>
                </div>

                <h4 className="pedido-titulo">
                  {p.repuesto_nombre}
                </h4>

                <div className="pedido-justificacion">
                  <span>
                    Cantidad:{" "}
                    <strong>
                      {p.cantidad} {p.unidad}
                    </strong>
                  </span>

                  <span>
                    {" "}· Fecha: {formatearFecha(p.fecha)}
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

