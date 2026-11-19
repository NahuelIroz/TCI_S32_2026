
import { useEffect, useState } from "react";

import type { Repuesto } from "../data/repuestos";

import {
  obtenerRepuestos,
  obtenerMovimientosRepuesto,
  type MovimientoStockAPI,
} from "../services/repuestosService";

import "./styles.css";

interface TrazabilidadRepuestoProps {
  onBack?: () => void;
  repuestoCodigoInicial?: string;
}

export default function TrazabilidadRepuesto({
  onBack,
  repuestoCodigoInicial,
}: TrazabilidadRepuestoProps) {

  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);

  const [repuestoSeleccionado, setRepuestoSeleccionado] =
    useState<string>(repuestoCodigoInicial ?? "");

  const [historialRepuesto, setHistorialRepuesto] =
    useState<MovimientoStockAPI[]>([]);

  const [cargandoRepuestos, setCargandoRepuestos] =
    useState(true);

  const [cargandoMovimientos, setCargandoMovimientos] =
    useState(false);

  const [errorRepuestos, setErrorRepuestos] = useState("");
  const [errorMovimientos, setErrorMovimientos] = useState("");

  // ==========================================
  // CARGAR REPUESTOS DESDE POSTGRESQL
  // ==========================================

  useEffect(() => {
    let activo = true;

    async function cargarRepuestos() {
      try {
        setCargandoRepuestos(true);
        setErrorRepuestos("");

        const datos = await obtenerRepuestos();

        if (!activo) return;

        setRepuestos(datos);

        setRepuestoSeleccionado((actual) => {
          if (datos.some((r) => r.codigo === actual)) {
            return actual;
          }

          return datos[0]?.codigo ?? "";
        });

      } catch (err) {
        if (!activo) return;

        setErrorRepuestos(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los repuestos."
        );

      } finally {
        if (activo) {
          setCargandoRepuestos(false);
        }
      }
    }

    cargarRepuestos();

    return () => {
      activo = false;
    };
  }, []);

  // ==========================================
  // REPUESTO SELECCIONADO
  // ==========================================

  const repuestoInfo = repuestos.find(
    (r) => r.codigo === repuestoSeleccionado
  );

  const repuestoId = repuestoInfo?.id;

  // ==========================================
  // CARGAR MOVIMIENTOS DEL REPUESTO
  // ==========================================

  useEffect(() => {
    let activo = true;

    if (repuestoId === undefined) {
      setHistorialRepuesto([]);
      setErrorMovimientos("");
      setCargandoMovimientos(false);
      return;
    }

    async function cargarMovimientos() {
      try {
        setCargandoMovimientos(true);
        setErrorMovimientos("");
        setHistorialRepuesto([]);

        const datos = await obtenerMovimientosRepuesto(
          repuestoId!
        );

        if (!activo) return;

        setHistorialRepuesto(datos);

      } catch (err) {
        if (!activo) return;

        setErrorMovimientos(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la trazabilidad."
        );

      } finally {
        if (activo) {
          setCargandoMovimientos(false);
        }
      }
    }

    cargarMovimientos();

    return () => {
      activo = false;
    };
  }, [repuestoId]);

  // ==========================================
  // FORMATEAR FECHA
  // ==========================================

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // ESTILO SEGÚN TIPO DE MOVIMIENTO
  // ==========================================

  const getHitoBadgeClass = (
    tipo: MovimientoStockAPI["tipo"]
  ) => {
    switch (tipo) {
      case "INGRESO":
        return "badge-aprobado";
      case "CONSUMO":
        return "badge-urgente";
      case "AJUSTE":
        return "badge-pendiente";
      default:
        return "";
    }
  };

  const getTituloMovimiento = (
    tipo: MovimientoStockAPI["tipo"]
  ) => {
    switch (tipo) {
      case "INGRESO":
        return "Recepción y Carga en Almacén (RN-08)";
      case "CONSUMO":
        return "Consumo de Repuesto";
      case "AJUSTE":
        return "Ajuste de Inventario";
      default:
        return "Movimiento de Stock";
    }
  };

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

        <h1>Trazabilidad de Repuestos</h1>
      </header>

      <div className="gestion-compras-body">

        <div className="subpantalla-encabezado">
          <span className="badge-seccion verde">
            Historia Interna
          </span>

          <p className="subpantalla-descripcion">
            Historial de movimientos registrados en el almacén.
            Los eventos de compra, reserva y uso se incorporarán
            cuando sus respectivos módulos estén conectados.
          </p>
        </div>

        {/* ======================================
            SELECTOR DE REPUESTOS
        ====================================== */}

        <div className="form-group mb-md">

          <label htmlFor="selectorRepuesto">
            Seleccionar pieza para auditar historia:
          </label>

          <select
            id="selectorRepuesto"
            value={repuestoSeleccionado}
            onChange={(e) =>
              setRepuestoSeleccionado(e.target.value)
            }
            disabled={cargandoRepuestos}
          >

            {repuestos.length === 0 && (
              <option value="">
                {cargandoRepuestos
                  ? "Cargando repuestos..."
                  : "No hay repuestos disponibles"}
              </option>
            )}

            {repuestos.map((r) => (
              <option key={r.id} value={r.codigo}>
                {r.codigo} — {r.nombre}
                {" "}
                (Stock actual: {r.disponible} {r.unidad})
              </option>
            ))}

          </select>
        </div>

        {errorRepuestos && (
          <p role="alert" style={{ color: "#dc3545" }}>
            {errorRepuestos}
          </p>
        )}

        {/* ======================================
            INFORMACIÓN DEL REPUESTO
        ====================================== */}

        {repuestoInfo && (
          <div className="tablero-bloque">

            <div className="tablero-bloque-header">

              <div>
                <span className="pedido-sku">
                  {repuestoInfo.codigo}
                </span>

                <h3 className="maquina-nombre mt-xs">
                  {repuestoInfo.nombre}
                </h3>
              </div>

              <span
                className={`badge-estado-pedido ${
                  repuestoInfo.disponible > repuestoInfo.minimo
                    ? "badge-aprobado"
                    : "badge-pendiente"
                }`}
              >
                Stock: {repuestoInfo.disponible}
                {" "}{repuestoInfo.unidad}
              </span>

            </div>

            <div className="pedido-detalles-grid">

              <div>
                <span className="detalle-rotulo">
                  Ubicación física:
                </span>

                <span className="detalle-valor">
                  {repuestoInfo.ubicacion}
                </span>
              </div>

              <div>
                <span className="detalle-rotulo">
                  Umbral mínimo:
                </span>

                <span className="detalle-valor">
                  {repuestoInfo.minimo}
                  {" "}{repuestoInfo.unidad}
                </span>
              </div>

              <div>
                <span className="detalle-rotulo">
                  Eventos registrados:
                </span>

                <span className="detalle-valor text-blue">
                  {historialRepuesto.length} movimientos
                </span>
              </div>

            </div>
          </div>
        )}

        {/* ======================================
            LÍNEA DE TIEMPO
        ====================================== */}

        <h3 className="seccion-subtitulo">
          Línea de tiempo interna
        </h3>

        {cargandoMovimientos && (
          <p className="no-items-msg">
            Cargando movimientos...
          </p>
        )}

        {errorMovimientos && (
          <p role="alert" style={{ color: "#dc3545" }}>
            {errorMovimientos}
          </p>
        )}

        {!cargandoMovimientos &&
          !errorMovimientos &&
          repuestoInfo &&
          historialRepuesto.length === 0 && (

          <p className="no-items-msg">
            No se han registrado movimientos para este repuesto aún.
          </p>
        )}

        {!cargandoMovimientos &&
          !errorMovimientos &&
          historialRepuesto.length > 0 && (

          <div className="trazabilidad-timeline">

            {historialRepuesto.map((movimiento, idx) => (

              <div
                key={movimiento.id}
                className="timeline-item"
              >

                <div className="timeline-marker">
                  <span className="timeline-numero">
                    {idx + 1}
                  </span>
                </div>

                <div className="timeline-contenido">

                  <div className="timeline-header">

                    <div>
                      <span
                        className={`badge-estado-pedido ${
                          getHitoBadgeClass(movimiento.tipo)
                        }`}
                      >
                        {getTituloMovimiento(movimiento.tipo)}
                      </span>

                      <strong className="timeline-ref ml-xs">
                        {movimiento.remito ??
                          `MOV-${movimiento.id}`}
                      </strong>
                    </div>

                    <span className="timeline-fecha">
                      {formatearFecha(movimiento.fecha)}
                    </span>
                  </div>

                  <p className="timeline-detalles">
                    {movimiento.motivo}
                    {movimiento.proveedor &&
                      ` · Proveedor: ${movimiento.proveedor}`}
                    {movimiento.observaciones &&
                      ` · ${movimiento.observaciones}`}
                  </p>

                  <div className="timeline-meta">

                    <span>
                      <strong>Cantidad:</strong>
                      {" "}{movimiento.cantidad}
                      {" "}{repuestoInfo?.unidad ?? "unid."}
                    </span>

                    <span>
                      <strong>Responsable:</strong>
                      {" "}
                      {movimiento.tecnico_delegado ??
                        "No informado"}
                    </span>

                    {movimiento.ubicacion && (
                      <span>
                        <strong>Ubicación:</strong>
                        {" "}{movimiento.ubicacion}
                      </span>
                    )}

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

