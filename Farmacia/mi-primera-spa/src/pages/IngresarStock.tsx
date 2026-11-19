
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Repuesto } from "../data/repuestos";

import {
  obtenerRepuestos,
  registrarIngresoStock,
} from "../services/repuestosService";

import {
  obtenerPedidosCompra,
  registrarRecepcionCompra,
  type PedidoCompraAPI,
  type RecepcionCompraResponse,
} from "../services/pedidosCompraService";

import { apiGet } from "../services/api";
import { servicioNotificaciones } from "../services/notificacionesService";

import "./styles.css";

interface IngresarStockProps {
  onBack?: () => void;
  titulo?: string;
  subtitulo?: string;
  modoRecepcionCompra?: boolean;
}

interface MovimientoRecepcion {
  id: number;
  repuesto_id: number;
  pedido_compra_id: number | null;
  tipo: string;
  cantidad: number;
}

interface PedidoConRecepcion {
  pedido: PedidoCompraAPI;
  recibido: number;
  pendiente: number;
}

async function consultarRecepciones(
  pedidos: PedidoCompraAPI[]
): Promise<PedidoConRecepcion[]> {
  const idsRepuestos = [
    ...new Set(pedidos.map((p) => p.repuesto_id)),
  ];

  const movimientosPorRepuesto = new Map<
    number,
    MovimientoRecepcion[]
  >();

  await Promise.all(
    idsRepuestos.map(async (repuestoId) => {
      const movimientos = await apiGet<MovimientoRecepcion[]>(
        `/api/v1/repuestos/${repuestoId}/movimientos`
      );

      movimientosPorRepuesto.set(repuestoId, movimientos);
    })
  );

  return pedidos.map((pedido) => {
    const movimientos =
      movimientosPorRepuesto.get(pedido.repuesto_id) ?? [];

    const recibido = movimientos
      .filter(
        (m) =>
          m.pedido_compra_id === pedido.id &&
          m.tipo === "INGRESO"
      )
      .reduce((total, m) => total + m.cantidad, 0);

    return {
      pedido,
      recibido,
      pendiente: Math.max(0, pedido.cantidad - recibido),
    };
  });
}

export default function IngresarStock({
  onBack,
  titulo = "Ingresar repuestos al almacén",
  subtitulo = "RN-08 · Carga de Compra y Ubicaciones",
  modoRecepcionCompra = false,
}: IngresarStockProps) {
  const [listaRepuestos, setListaRepuestos] =
    useState<Repuesto[]>([]);

  const [pedidosAprobados, setPedidosAprobados] =
    useState<PedidoConRecepcion[]>([]);

  const [pedidoSeleccionadoId, setPedidoSeleccionadoId] =
    useState<number>(0);

  const [repuestoSeleccionadoId, setRepuestoSeleccionadoId] =
    useState<number>(0);

  const [cantidad, setCantidad] = useState<number>(1);
  const [remito, setRemito] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [proveedor, setProveedor] = useState(
    "Distribuidora Industrial S.A."
  );

  const [tecnicoDelegado, setTecnicoDelegado] = useState(
    "Carlos Gómez (Mantenimiento)"
  );

  const [observaciones, setObservaciones] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [error, setError] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const pedidoSeleccionado = pedidosAprobados.find(
    (item) => item.pedido.id === pedidoSeleccionadoId
  );

  const repuestoActual = listaRepuestos.find(
    (r) => r.id === repuestoSeleccionadoId
  );

  function seleccionarPedido(
    item: PedidoConRecepcion,
    repuestos: Repuesto[]
  ) {
    const pedido = item.pedido;

    setPedidoSeleccionadoId(pedido.id);
    setRepuestoSeleccionadoId(pedido.repuesto_id);
    setCantidad(item.pendiente);
    setProveedor(pedido.proveedor);

    const repuesto = repuestos.find(
      (r) => r.id === pedido.repuesto_id
    );

    setUbicacion(repuesto?.ubicacion ?? "");
  }

  // ==========================================
  // CARGA INICIAL
  // ==========================================

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        setCargando(true);
        setError("");

        const repuestos = await obtenerRepuestos();

        if (!activo) return;

        setListaRepuestos(repuestos);

        if (modoRecepcionCompra) {
          const pedidos = await obtenerPedidosCompra();

          const aprobados = pedidos.filter(
            (p) => p.estado === "Aprobado"
          );

          const conRecepciones =
            await consultarRecepciones(aprobados);

          if (!activo) return;

          const disponibles = conRecepciones.filter(
            (item) => item.pendiente > 0
          );

          setPedidosAprobados(disponibles);

          if (disponibles.length > 0) {
            seleccionarPedido(disponibles[0], repuestos);
          } else {
            setPedidoSeleccionadoId(0);
            setRepuestoSeleccionadoId(0);
            setCantidad(0);
            setProveedor("");
          }
        } else if (repuestos.length > 0) {
          setRepuestoSeleccionadoId(repuestos[0].id);
          setUbicacion(repuestos[0].ubicacion);
        }
      } catch (err) {
        if (!activo) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los datos."
        );
      } finally {
        if (activo) setCargando(false);
      }
    }

    void cargarDatos();

    return () => {
      activo = false;
    };
  }, [modoRecepcionCompra]);

  // ==========================================
  // SELECCIONAR REPUESTO MANUALMENTE
  // ==========================================

  function handleRepuestoChange(id: number) {
    if (modoRecepcionCompra) return;

    setRepuestoSeleccionadoId(id);
    setMensajeExito("");
    setError("");

    const encontrado = listaRepuestos.find(
      (r) => r.id === id
    );

    if (encontrado) {
      setUbicacion(encontrado.ubicacion);
    }
  }

  // ==========================================
  // SELECCIONAR PEDIDO DE COMPRA
  // ==========================================

  function handlePedidoChange(id: number) {
    const item = pedidosAprobados.find(
      (p) => p.pedido.id === id
    );

    if (!item) return;

    seleccionarPedido(item, listaRepuestos);
    setMensajeExito("");
    setError("");
  }

  // ==========================================
  // ACTUALIZAR DATOS DESPUÉS DE GUARDAR
  // ==========================================

  async function actualizarDespuesDeIngreso(
    repuestoId: number,
    stockActual: number,
    ubicacionNueva: string,
    pedidoAnteriorId: number
  ) {
    let repuestosActualizados: Repuesto[];

    try {
      repuestosActualizados = await obtenerRepuestos();
    } catch {
      repuestosActualizados = listaRepuestos.map((r) =>
        r.id === repuestoId
          ? {
              ...r,
              disponible: stockActual,
              ubicacion: ubicacionNueva,
              estado:
                stockActual === 0
                  ? "Agotado"
                  : stockActual <= r.minimo
                    ? "Stock Bajo"
                    : "Disponible",
            }
          : r
      );
    }

    setListaRepuestos(repuestosActualizados);

    if (!modoRecepcionCompra) return;

    const pedidos = await obtenerPedidosCompra();

    const aprobados = pedidos.filter(
      (p) => p.estado === "Aprobado"
    );

    const conRecepciones =
      await consultarRecepciones(aprobados);

    const disponibles = conRecepciones.filter(
      (item) => item.pendiente > 0
    );

    setPedidosAprobados(disponibles);

    const mismoPedido = disponibles.find(
      (item) => item.pedido.id === pedidoAnteriorId
    );

    const siguiente = mismoPedido ?? disponibles[0];

    if (siguiente) {
      seleccionarPedido(siguiente, repuestosActualizados);
    } else {
      setPedidoSeleccionadoId(0);
      setRepuestoSeleccionadoId(0);
      setCantidad(0);
      setProveedor("");
      setUbicacion("");
    }
  }

  // ==========================================
  // REGISTRAR INGRESO / RECEPCIÓN
  // ==========================================

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (guardando || cargando) return;

    setError("");
    setMensajeExito("");

    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
      setError(
        "La cantidad debe ser un número entero mayor a cero."
      );
      return;
    }

    if (!repuestoActual) {
      setError("Seleccioná un repuesto válido.");
      return;
    }

    if (modoRecepcionCompra) {
      if (!pedidoSeleccionado) {
        setError("Seleccioná un pedido aprobado.");
        return;
      }

      if (cantidad > pedidoSeleccionado.pendiente) {
        setError(
          `Solo quedan ${pedidoSeleccionado.pendiente} ` +
          "unidades pendientes de recepción."
        );
        return;
      }
    }

    if (
      !remito.trim() ||
      !ubicacion.trim() ||
      !proveedor.trim() ||
      !tecnicoDelegado.trim()
    ) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    const datosIngreso = {
      cantidad,
      remito: remito.trim(),
      ubicacion: ubicacion.trim(),
      proveedor: proveedor.trim(),
      tecnico_delegado: tecnicoDelegado.trim(),
      observaciones: observaciones.trim(),
    };

    const repuestoIngresado = repuestoActual;
    const pedidoIngresado = pedidoSeleccionado;
    const pedidoId = pedidoIngresado?.pedido.id ?? 0;

    setGuardando(true);

    try {
      const resultado = modoRecepcionCompra
        ? await registrarRecepcionCompra(
            pedidoId,
            datosIngreso
          )
        : await registrarIngresoStock(
            repuestoIngresado.id,
            datosIngreso
          );

      // El backend confirmó el ingreso.
      // Desde este punto, no debemos volver a enviarlo
      // aunque falle la actualización de la pantalla.

      let detalleRecepcion = "";

      if (modoRecepcionCompra) {
        const recepcion =
          resultado as RecepcionCompraResponse;

        detalleRecepcion =
          recepcion.cantidad_pendiente === 0
            ? " Pedido de compra recibido completamente."
            : ` Quedan ${recepcion.cantidad_pendiente} ` +
              "unidades pendientes.";
      }

      setMensajeExito(
        `✓ RN-08 Confirmado: Se sumaron ${cantidad} ` +
        `${repuestoIngresado.unidad} a ` +
        `${repuestoIngresado.nombre}. ` +
        `Nuevo stock: ${resultado.stock_actual} ` +
        `${repuestoIngresado.unidad}. ` +
        `Movimiento N° ${resultado.movimiento.id}.` +
        detalleRecepcion
      );

      setRemito("");
      setObservaciones("");

      try {
        await actualizarDespuesDeIngreso(
          repuestoIngresado.id,
          resultado.stock_actual,
          datosIngreso.ubicacion,
          pedidoId
        );
      } catch (errorActualizacion) {
        console.warn(
          "El ingreso fue guardado, pero falló la actualización de datos:",
          errorActualizacion
        );

        // No informamos un error de guardado porque
        // la transacción ya fue confirmada.
        setError(
          "El ingreso se registró correctamente, pero " +
          "no se pudo actualizar el listado. " +
          "Volvé a abrir esta pantalla antes de registrar otro."
        );

        setCargando(true);
      }

      // Notificación existente.
      // No forma parte de la transacción de stock.
      try {
        await servicioNotificaciones.enviarNotificacion(
          "cambio_parte",
          `CARGA RN-08: ${cantidad} ` +
            `${repuestoIngresado.unidad} recibidas de ` +
            repuestoIngresado.nombre,
          [
            "encargados@planta.farmacia.com",
            "compras@planta.farmacia.com",
          ],
          `Remito ${datosIngreso.remito}: ` +
            `Se cargó stock físico en ` +
            `${datosIngreso.ubicacion}. ` +
            `Tarea delegada a: ` +
            `${datosIngreso.tecnico_delegado}. ` +
            `Nuevo stock total: ` +
            `${resultado.stock_actual} ` +
            `${repuestoIngresado.unidad}.`
        );
      } catch (errorNotificacion) {
        console.error(
          "El stock se guardó, pero falló la notificación:",
          errorNotificacion
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el ingreso de stock."
      );
    } finally {
      setGuardando(false);
    }
  }

  // ==========================================
  // INTERFAZ
  // ==========================================

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

        <h1>{titulo}</h1>
      </header>

      <form
        className="incidencia-form"
        onSubmit={handleSubmit}
      >
        <div className="subpantalla-encabezado">
          <p className="subpantalla-descripcion">
            {subtitulo}. Registrá la entrada de
            mercadería al almacén, actualizá el stock
            físico, definí la ubicación y delegá
            la supervisión física.
          </p>
        </div>

        {cargando && (
          <p className="mis-vacio">
            Cargando datos desde FastAPI...
          </p>
        )}

        {error && (
          <div
            role="alert"
            style={{ color: "#dc3545" }}
          >
            {error}
          </div>
        )}

        {mensajeExito && (
          <div
            className="alerta-exito"
            role="status"
          >
            <strong>{mensajeExito}</strong>
          </div>
        )}

        {/* PEDIDOS DE COMPRA APROBADOS */}
        {modoRecepcionCompra && (
          <div className="campo">
            <label htmlFor="pedido-compra-select">
              Pedido de compra aprobado
            </label>

            <select
              id="pedido-compra-select"
              className="input-formulario"
              value={pedidoSeleccionadoId}
              onChange={(e) =>
                handlePedidoChange(Number(e.target.value))
              }
              disabled={cargando || guardando}
            >
              {pedidosAprobados.length === 0 && (
                <option value={0}>
                  No hay compras aprobadas pendientes
                </option>
              )}

              {pedidosAprobados.map((item) => (
                <option
                  key={item.pedido.id}
                  value={item.pedido.id}
                >
                  {item.pedido.codigo_pedido} -{" "}
                  {item.pedido.repuesto_nombre}
                </option>
              ))}
            </select>

            {pedidoSeleccionado && (
              <div
                className="repuesto-seleccionado-info"
                style={{ marginTop: "12px" }}
              >
                <div>
                  <span>Pedido: </span>
                  <strong>
                    {pedidoSeleccionado.pedido.codigo_pedido}
                  </strong>
                </div>

                <div>
                  <span>Cantidad solicitada: </span>
                  <strong>
                    {pedidoSeleccionado.pedido.cantidad}{" "}
                    {pedidoSeleccionado.pedido.unidad}
                  </strong>
                </div>

                <div>
                  <span>Cantidad ya recibida: </span>
                  <strong>
                    {pedidoSeleccionado.recibido}{" "}
                    {pedidoSeleccionado.pedido.unidad}
                  </strong>
                </div>

                <div>
                  <span>Cantidad pendiente: </span>
                  <strong>
                    {pedidoSeleccionado.pendiente}{" "}
                    {pedidoSeleccionado.pedido.unidad}
                  </strong>
                </div>

                <div>
                  <span>Proveedor: </span>
                  <strong>
                    {pedidoSeleccionado.pedido.proveedor}
                  </strong>
                </div>

                <div>
                  <span>Estado: </span>
                  <strong>Aprobado</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REPUESTO */}
        <div className="campo">
          <label htmlFor="repuesto-select">
            Repuesto recibido
          </label>

          <select
            id="repuesto-select"
            className="input-formulario"
            value={repuestoSeleccionadoId}
            onChange={(e) =>
              handleRepuestoChange(Number(e.target.value))
            }
            disabled={
              cargando ||
              guardando ||
              modoRecepcionCompra
            }
          >
            {(!repuestoActual ||
              listaRepuestos.length === 0) && (
              <option value={0}>
                No hay repuesto seleccionado
              </option>
            )}

            {listaRepuestos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.codigo} - {r.nombre}
                {" "} (Stock actual: {r.disponible}{" "}
                {r.unidad})
              </option>
            ))}
          </select>
        </div>

        {repuestoActual && (
          <div className="repuesto-seleccionado-info">
            <div>
              <span>Código: </span>
              <strong>{repuestoActual.codigo}</strong>
            </div>

            <div>
              <span>Stock Físico Actual: </span>
              <strong>
                {repuestoActual.disponible}{" "}
                {repuestoActual.unidad}
              </strong>
            </div>

            <div>
              <span>Umbral Mínimo: </span>
              <strong>
                {repuestoActual.minimo}{" "}
                {repuestoActual.unidad}
              </strong>
            </div>
          </div>
        )}

        {/* CANTIDAD */}
        <div className="campo">
          <label htmlFor="cantidad-input">
            Cantidad recibida
          </label>

          <input
            id="cantidad-input"
            type="number"
            min={1}
            max={
              modoRecepcionCompra
                ? pedidoSeleccionado?.pendiente
                : undefined
            }
            step={1}
            className="input-formulario"
            value={cantidad}
            onChange={(e) =>
              setCantidad(Number(e.target.value))
            }
            disabled={cargando || guardando}
            required
          />
        </div>

        {/* REMITO */}
        <div className="campo">
          <label htmlFor="remito-input">
            N° de Remito / Orden de Compra
          </label>

          <input
            id="remito-input"
            type="text"
            className="input-formulario"
            value={remito}
            onChange={(e) =>
              setRemito(e.target.value)
            }
            placeholder="Ej. REM-2026-0045"
            maxLength={100}
            disabled={cargando || guardando}
            required
          />
        </div>

        {/* UBICACIÓN */}
        <div className="campo">
          <label htmlFor="ubicacion-input">
            Ubicación física en el depósito
          </label>

          <input
            id="ubicacion-input"
            type="text"
            className="input-formulario"
            value={ubicacion}
            onChange={(e) =>
              setUbicacion(e.target.value)
            }
            placeholder="Ej. Pasillo A · Estante 2 (Nivel 1)"
            maxLength={200}
            disabled={cargando || guardando}
            required
          />
        </div>

        {/* TÉCNICO DELEGADO */}
        <div className="campo">
          <label htmlFor="delegar-input">
            Delegar y supervisar carga física
          </label>

          <select
            id="delegar-input"
            className="input-formulario"
            value={tecnicoDelegado}
            onChange={(e) =>
              setTecnicoDelegado(e.target.value)
            }
            disabled={cargando || guardando}
          >
            <option value="Carlos Gómez (Mantenimiento)">
              Carlos Gómez (Mantenimiento)
            </option>
            <option value="J. Morales (Mantenimiento)">
              J. Morales (Mantenimiento)
            </option>
            <option value="M. López (Mantenimiento)">
              M. López (Mantenimiento)
            </option>
            <option value="Ing. Martín Bianchi (Encargado)">
              Ing. Martín Bianchi (Encargado - Directo)
            </option>
          </select>
        </div>

        {/* PROVEEDOR */}
        <div className="campo">
          <label htmlFor="proveedor-input">
            Proveedor / Origen
          </label>

          <input
            id="proveedor-input"
            type="text"
            className="input-formulario"
            value={proveedor}
            onChange={(e) =>
              setProveedor(e.target.value)
            }
            maxLength={200}
            disabled={cargando || guardando}
            required
          />
        </div>

        {/* OBSERVACIONES */}
        <div className="campo">
          <label htmlFor="obs-input">
            Observaciones de recepción
          </label>

          <textarea
            id="obs-input"
            value={observaciones}
            onChange={(e) =>
              setObservaciones(e.target.value)
            }
            placeholder={
              "Lote de fabricación, estado de empaques, etc."
            }
            disabled={cargando || guardando}
          />
        </div>

        {/* CONFIRMAR */}
        <button
          type="submit"
          className="boton-enviar"
          disabled={
            cargando ||
            guardando ||
            !repuestoActual ||
            (modoRecepcionCompra &&
              (!pedidoSeleccionado ||
                pedidoSeleccionado.pendiente <= 0))
          }
        >
          {guardando
            ? "Registrando ingreso..."
            : modoRecepcionCompra
              ? "Confirmar recepción de compra"
              : "Cargar stock físico y ubicación"}
        </button>
      </form>
    </div>
  );
}
