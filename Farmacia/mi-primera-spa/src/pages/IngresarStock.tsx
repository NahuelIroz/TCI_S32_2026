
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Repuesto } from "../data/repuestos";

import {
  obtenerRepuestos,
  registrarIngresoStock,
} from "../services/repuestosService";

import { servicioNotificaciones } from "../services/notificacionesService";

import "./styles.css";

interface IngresarStockProps {
  onBack?: () => void;
  titulo?: string;
  subtitulo?: string;
}

export default function IngresarStock({
  onBack,
  titulo = "Ingresar repuestos al almacén",
  subtitulo = "RN-08 · Carga de Compra y Ubicaciones",
}: IngresarStockProps) {

  const [listaRepuestos, setListaRepuestos] =
    useState<Repuesto[]>([]);

  const [repuestoSeleccionadoId, setRepuestoSeleccionadoId] =
    useState<number>(0);

  const [cantidad, setCantidad] = useState<number>(5);

  const [remito, setRemito] =
    useState<string>("REM-2026-0045");

  const [ubicacion, setUbicacion] = useState<string>("");

  const [proveedor, setProveedor] = useState<string>(
    "Distribuidora Industrial S.A."
  );

  const [tecnicoDelegado, setTecnicoDelegado] =
    useState<string>("Carlos Gómez (Mantenimiento)");

  const [observaciones, setObservaciones] =
    useState<string>("");

  const [mensajeExito, setMensajeExito] =
    useState<string>("");

  const [error, setError] = useState<string>("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // ==========================================
  // CARGAR REPUESTOS DESDE FASTAPI
  // ==========================================

  useEffect(() => {
    let activo = true;

    async function cargarRepuestos() {
      try {
        setCargando(true);
        setError("");

        const datos = await obtenerRepuestos();

        if (!activo) return;

        setListaRepuestos(datos);

        if (datos.length > 0) {
          setRepuestoSeleccionadoId(datos[0].id);
          setUbicacion(datos[0].ubicacion);
        }

      } catch (err) {
        if (!activo) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los repuestos."
        );

      } finally {
        if (activo) setCargando(false);
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

  const repuestoActual = listaRepuestos.find(
    (r) => r.id === repuestoSeleccionadoId
  );

  const handleRepuestoChange = (id: number) => {
    setRepuestoSeleccionadoId(id);
    setMensajeExito("");

    const encontrado = listaRepuestos.find(
      (r) => r.id === id
    );

    if (encontrado) {
      setUbicacion(encontrado.ubicacion);
    }
  };

  // ==========================================
  // REGISTRAR INGRESO EN FASTAPI
  // ==========================================

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (guardando) return;

    setError("");
    setMensajeExito("");

    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
      setError("La cantidad debe ser un número entero mayor a cero.");
      return;
    }

    if (!repuestoActual) {
      setError("Seleccioná un repuesto válido.");
      return;
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

    setGuardando(true);

    try {
      const resultado = await registrarIngresoStock(
        repuestoActual.id,
        {
          cantidad,
          remito: remito.trim(),
          ubicacion: ubicacion.trim(),
          proveedor: proveedor.trim(),
          tecnico_delegado: tecnicoDelegado.trim(),
          observaciones: observaciones.trim(),
        }
      );

      // Volver a consultar PostgreSQL para actualizar
      // todos los repuestos del selector.
      try {
        const repuestosActualizados = await obtenerRepuestos();
        setListaRepuestos(repuestosActualizados);
      } catch {
        // El ingreso ya fue confirmado. Actualizamos
        // al menos el repuesto ingresado en pantalla.
        setListaRepuestos((prev) =>
          prev.map((r) =>
            r.id === repuestoActual.id
              ? {
                  ...r,
                  disponible: resultado.stock_actual,
                  ubicacion: ubicacion.trim(),
                  estado:
                    resultado.stock_actual === 0
                      ? "Agotado"
                      : resultado.stock_actual <= r.minimo
                        ? "Stock Bajo"
                        : "Disponible",
                }
              : r
          )
        );
      }

      setMensajeExito(
        `✓ RN-08 Confirmado: Se sumaron ${cantidad} ` +
        `${repuestoActual.unidad} a ${repuestoActual.nombre}. ` +
        `Ubicación: "${ubicacion}". ` +
        `Tarea supervisada para ${tecnicoDelegado}. ` +
        `Nuevo stock: ${resultado.stock_actual} ` +
        `${repuestoActual.unidad}. ` +
        `Movimiento N° ${resultado.movimiento.id}.`
      );

      setObservaciones("");

      // Notificación existente: se ejecuta únicamente
      // después de que FastAPI confirma el ingreso.
      try {
        await servicioNotificaciones.enviarNotificacion(
          "cambio_parte",
          `CARGA RN-08: ${cantidad} ${repuestoActual.unidad} recibidas de ${repuestoActual.nombre}`,
          [
            "encargados@planta.farmacia.com",
            "compras@planta.farmacia.com",
          ],
          `Remito ${remito}: Se cargó stock físico en ${ubicacion}. ` +
          `Tarea delegada a: ${tecnicoDelegado}. ` +
          `Nuevo stock total: ${resultado.stock_actual} ${repuestoActual.unidad}.`
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

        <h1>{titulo}</h1>
      </header>

      <form
        className="incidencia-form"
        onSubmit={handleSubmit}
      >

        <div className="subpantalla-encabezado">
          <p className="subpantalla-descripcion">
            {subtitulo}. Registrá la entrada de mercadería
            de compras al almacén, actualizá el stock físico,
            definí la ubicación y delegá la supervisión física.
          </p>
        </div>

        {cargando && (
          <p className="mis-vacio">
            Cargando repuestos...
          </p>
        )}

        {error && (
          <div role="alert" style={{ color: "#dc3545" }}>
            {error}
          </div>
        )}

        {mensajeExito && (
          <div className="alerta-exito" role="status">
            <strong>{mensajeExito}</strong>
          </div>
        )}

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
            disabled={cargando || guardando}
          >
            {listaRepuestos.length === 0 && (
              <option value={0}>
                No hay repuestos disponibles
              </option>
            )}

            {listaRepuestos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.codigo} - {r.nombre}
                {" "} (Stock actual: {r.disponible} {r.unidad})
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
                {repuestoActual.disponible} {repuestoActual.unidad}
              </strong>
            </div>

            <div>
              <span>Umbral Mínimo: </span>
              <strong>
                {repuestoActual.minimo} {repuestoActual.unidad}
              </strong>
            </div>
          </div>
        )}

        <div className="campo">
          <label htmlFor="cantidad-input">
            Cantidad recibida
          </label>

          <input
            id="cantidad-input"
            type="number"
            min={1}
            step={1}
            className="input-formulario"
            value={cantidad}
            onChange={(e) =>
              setCantidad(Number(e.target.value))
            }
            disabled={guardando}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="remito-input">
            N° de Remito / Orden de Compra
          </label>

          <input
            id="remito-input"
            type="text"
            className="input-formulario"
            value={remito}
            onChange={(e) => setRemito(e.target.value)}
            placeholder="Ej. REM-2026-0045"
            maxLength={100}
            disabled={guardando}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="ubicacion-input">
            Ubicación física en el depósito
          </label>

          <input
            id="ubicacion-input"
            type="text"
            className="input-formulario"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej. Pasillo A · Estante 2 (Nivel 1)"
            maxLength={200}
            disabled={guardando}
            required
          />
        </div>

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
            disabled={guardando}
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

        <div className="campo">
          <label htmlFor="proveedor-input">
            Proveedor / Origen
          </label>

          <input
            id="proveedor-input"
            type="text"
            className="input-formulario"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            maxLength={200}
            disabled={guardando}
            required
          />
        </div>

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
            placeholder="Lote de fabricación, estado de empaques, etc."
            disabled={guardando}
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
            ? "Registrando ingreso..."
            : "Cargar stock físico y ubicación"}
        </button>

      </form>
    </div>
  );
}
