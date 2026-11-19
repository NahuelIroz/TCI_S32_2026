
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Repuesto } from "../data/repuestos";
import { reservasIniciales } from "../data/reservas";

import {
  obtenerRepuestos,
  obtenerMovimientosRepuesto,
  registrarConsumoStock,
  type MovimientoStockAPI,
} from "../services/repuestosService";

import { servicioNotificaciones } from "../services/notificacionesService";
import "./styles.css";

interface RegistrarUsoRepuestoProps {
  onBack?: () => void;
  onGenerarPedidoCompra?: (repuesto: Repuesto) => void;
}

interface RegistroUso {
  id: number;
  maquina: string;
  repuestoNombre: string;
  codigo: string;
  cantidad: number;
  unidad: string;
  motivo: string;
  fecha: string;
  ordenTrabajo: string;
}

const TECNICO_ACTUAL = "Carlos Gómez (Mantenimiento)";

function formatearFecha(fecha: string): string {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RegistrarUsoRepuesto({
  onBack,
  onGenerarPedidoCompra,
}: RegistrarUsoRepuestoProps) {
  const [listaRepuestos, setListaRepuestos] = useState<Repuesto[]>([]);
  const [maquina, setMaquina] = useState("Envasadora Rotativa #03");
  const [repuestoId, setRepuestoId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState(
    "Cambio correctivo por vibración y desgaste"
  );
  const [ordenTrabajo, setOrdenTrabajo] = useState("OT-2026-089");

  const [mensajeExito, setMensajeExito] = useState("");
  const [error, setError] = useState("");
  const [mostrarBotonCompra, setMostrarBotonCompra] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState("");

  const [historialUsos, setHistorialUsos] = useState<RegistroUso[]>([]);

  const repuestoActual = listaRepuestos.find(
    (r) => r.id === repuestoId
  );

  // Reservas simuladas: solo para bloqueo provisional.
  const reservasActivas = reservasIniciales.filter(
    (res) =>
      res.repuestoCodigo === repuestoActual?.codigo &&
      res.estado === "Activa"
  );

  const tieneReservasSimuladas = reservasActivas.length > 0;

  async function cargarRepuestos() {
    const datos = await obtenerRepuestos();

    setListaRepuestos(datos);

    setRepuestoId((actual) => {
      if (datos.some((r) => r.id === actual)) {
        return actual;
      }

      return datos[0]?.id ?? null;
    });

    return datos;
  }

  async function cargarHistorial(repuestosActuales: Repuesto[]) {
    setCargandoHistorial(true);
    setErrorHistorial("");

    try {
      const resultados = await Promise.all(
        repuestosActuales.map(async (repuesto) => {
          const movimientos = await obtenerMovimientosRepuesto(
            repuesto.id
          );

          return movimientos
            .filter((m) => m.tipo === "CONSUMO")
            .map((m: MovimientoStockAPI): RegistroUso => ({
              id: m.id,
              maquina: m.maquina ?? "No informada",
              repuestoNombre: repuesto.nombre,
              codigo: repuesto.codigo,
              cantidad: m.cantidad,
              unidad: repuesto.unidad,
              motivo: m.motivo,
              fecha: m.fecha,
              ordenTrabajo: m.orden_trabajo ?? "",
            }));
        })
      );

      const historial = resultados
        .flat()
        .sort(
          (a, b) =>
            new Date(b.fecha).getTime() -
              new Date(a.fecha).getTime() ||
            b.id - a.id
        );

      setHistorialUsos(historial);
    } catch (err) {
      setErrorHistorial(
        err instanceof Error
          ? err.message
          : "No se pudo consultar el historial de consumos."
      );
    } finally {
      setCargandoHistorial(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function iniciar() {
      try {
        setCargando(true);

        const datos = await obtenerRepuestos();

        if (!activo) return;

        setListaRepuestos(datos);
        setRepuestoId(datos[0]?.id ?? null);
      } catch (err) {
        if (!activo) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los repuestos."
        );
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    iniciar();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (cargando || listaRepuestos.length === 0) return;

    void cargarHistorial(listaRepuestos);

    // El historial se carga al obtener inicialmente los repuestos.
    // Después de un consumo se actualiza explícitamente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (guardando) return;

    setError("");
    setMensajeExito("");
    setMostrarBotonCompra(false);

    if (!repuestoActual) {
      setError("Seleccioná un repuesto válido.");
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setError(
        "RN-01: La cantidad debe ser un número entero mayor o igual a 1."
      );
      return;
    }

    if (!maquina.trim() || !ordenTrabajo.trim() || !motivo.trim()) {
      setError(
        "Completá la máquina, la orden de trabajo y el motivo."
      );
      return;
    }

    if (tieneReservasSimuladas) {
      setError(
        "Este repuesto tiene reservas registradas en los datos de prueba. " +
        "Su consumo permanecerá bloqueado hasta conectar las reservas " +
        "con PostgreSQL."
      );
      return;
    }

    if (cantidad > repuestoActual.disponible) {
      setError(
        `RN-01: Stock insuficiente. Disponible: ` +
        `${repuestoActual.disponible} ${repuestoActual.unidad}. ` +
        `Solicitado: ${cantidad}.`
      );
      setMostrarBotonCompra(true);
      return;
    }

    setGuardando(true);

    try {
      const resultado = await registrarConsumoStock(
        repuestoActual.id,
        {
          cantidad,
          maquina: maquina.trim(),
          orden_trabajo: ordenTrabajo.trim(),
          motivo: motivo.trim(),
          tecnico: TECNICO_ACTUAL,
        }
      );

      const nuevoStock = resultado.stock_actual;

      setMensajeExito(
        `✓ RN-01: Se descontaron ${cantidad} ` +
        `${repuestoActual.unidad} de ${repuestoActual.nombre} ` +
        `para ${maquina}. Stock físico restante: ` +
        `${nuevoStock} ${repuestoActual.unidad}. ` +
        `Movimiento #${resultado.movimiento.id}.`
      );

      // Notificar únicamente después de confirmar el consumo.
      try {
        servicioNotificaciones.enviarNotificacion(
          "cambio_parte",
          `🔧 USO RN-01: ${cantidad} ${repuestoActual.unidad} consumidas en ${maquina}`,
          [
            "encargados@planta.farmacia.com",
            "supervisores@planta.farmacia.com",
          ],
          `Orden ${ordenTrabajo}: ${repuestoActual.nombre} ` +
          `(${repuestoActual.codigo}). Stock restante: ` +
          `${nuevoStock} ${repuestoActual.unidad}.`
        );

        if (nuevoStock <= repuestoActual.minimo) {
          servicioNotificaciones.enviarNotificacion(
            "alerta_umbral",
            `⚠️ ALERTA RN-02: Stock mínimo alcanzado para ${repuestoActual.nombre}`,
            [
              "encargados@planta.farmacia.com",
              "gerencia@planta.farmacia.com",
              "compras@planta.farmacia.com",
            ],
            `El repuesto ${repuestoActual.codigo} cayó a ` +
            `${nuevoStock} ${repuestoActual.unidad} ` +
            `(umbral mínimo: ${repuestoActual.minimo}).`
          );
        }
      } catch (errorNotificacion) {
        console.warn(
          "El consumo se guardó, pero falló una notificación:",
          errorNotificacion
        );
      }

      // Actualizar la información real.
      try {
        const repuestosActualizados = await cargarRepuestos();
        await cargarHistorial(repuestosActualizados);
      } catch (errorActualizacion) {
        console.warn(
          "Consumo guardado, pero falló la actualización de datos:",
          errorActualizacion
        );

        setListaRepuestos((anteriores) =>
          anteriores.map((r) =>
            r.id === repuestoActual.id
              ? {
                  ...r,
                  disponible: nuevoStock,
                  estado:
                    nuevoStock === 0
                      ? "Agotado"
                      : nuevoStock <= r.minimo
                      ? "Stock Bajo"
                      : "Disponible",
                }
              : r
          )
        );
      }

      setCantidad(1);
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo registrar el consumo.";

      setError(
        `No se pudo confirmar el consumo: ${mensaje}. ` +
        "Verificá el stock antes de reintentar."
      );

      try {
        await cargarRepuestos();
      } catch {
        // Se conserva el error original.
      }
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
        <h1>Registrar repuestos en reparación</h1>
      </header>

      <form className="incidencia-form" onSubmit={handleSubmit}>
        <div className="subpantalla-encabezado">
          <p className="subpantalla-descripcion">
            Descontá del stock físico las partes utilizadas (≥ 1).
            Los consumos se registran en PostgreSQL y quedan
            disponibles en la trazabilidad del repuesto.
          </p>
        </div>

        {error && (
          <div className="alerta-error" role="alert">
            <p>⚠️ {error}</p>

            {mostrarBotonCompra &&
              onGenerarPedidoCompra &&
              repuestoActual && (
                <button
                  type="button"
                  className="btn-accion btn-cotizar mt-xs"
                  onClick={() =>
                    onGenerarPedidoCompra(repuestoActual)
                  }
                >
                  Reportar Faltante y Generar Pedido de Compra →
                </button>
              )}
          </div>
        )}

        {mensajeExito && (
          <div className="alerta-exito" role="status">
            <strong>{mensajeExito}</strong>
          </div>
        )}

        {cargando && (
          <p className="no-items-msg">Cargando repuestos...</p>
        )}

        <div className="campo">
          <label htmlFor="maquina">
            Máquina o Equipo reparado
          </label>

          <select
            id="maquina"
            className="input-formulario"
            value={maquina}
            onChange={(e) => setMaquina(e.target.value)}
            disabled={guardando}
          >
            <option value="Envasadora Rotativa #03">
              Envasadora Rotativa #03
            </option>
            <option value="Prensa Hidráulica H-12">
              Prensa Hidráulica H-12
            </option>
            <option value="Compresor Central C-01">
              Compresor Central C-01
            </option>
            <option value="Blistera Automática #04">
              Blistera Automática #04
            </option>
            <option value="Lavadora de Ampollas L-02">
              Lavadora de Ampollas L-02
            </option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="repuesto-usado">
            Repuesto utilizado
          </label>

          <select
            id="repuesto-usado"
            className="input-formulario"
            value={repuestoId ?? ""}
            disabled={cargando || guardando}
            onChange={(e) => {
              setRepuestoId(Number(e.target.value));
              setError("");
              setMensajeExito("");
              setMostrarBotonCompra(false);
            }}
          >
            {listaRepuestos.length === 0 && (
              <option value="">
                No hay repuestos disponibles
              </option>
            )}

            {listaRepuestos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.codigo} - {r.nombre}
                {" "}
                (Stock Físico: {r.disponible} {r.unidad})
              </option>
            ))}
          </select>
        </div>

        {repuestoActual && (
          <div className="repuesto-uso-resumen">
            <div>
              <span>Ubicación: </span>
              <strong>{repuestoActual.ubicacion}</strong>
            </div>

            <div>
              <span>Stock Físico: </span>
              <strong>
                {repuestoActual.disponible} {repuestoActual.unidad}
              </strong>
            </div>

            <div>
              <span>Reservas de prueba: </span>
              <strong>
                {tieneReservasSimuladas
                  ? `${reservasActivas.length} activas (consumo bloqueado)`
                  : "Ninguna registrada"}
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

        {tieneReservasSimuladas && (
          <div className="tablero-bloque mt-sm">
            <p className="subpantalla-descripcion">
              Este repuesto tiene reservas en los datos de prueba.
              El consumo está deshabilitado temporalmente hasta
              implementar la gestión de reservas en PostgreSQL.
            </p>
          </div>
        )}

        <div className="campo">
          <label htmlFor="cantidad-usada">
            Cantidad consumida
          </label>

          <input
            id="cantidad-usada"
            type="number"
            min={1}
            step={1}
            className="input-formulario"
            value={cantidad}
            onChange={(e) =>
              setCantidad(Number(e.target.value))
            }
            disabled={guardando || cargando}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="orden-trabajo">
            N° Orden de Trabajo / Reparación
          </label>

          <input
            id="orden-trabajo"
            type="text"
            className="input-formulario"
            value={ordenTrabajo}
            onChange={(e) =>
              setOrdenTrabajo(e.target.value)
            }
            disabled={guardando}
            maxLength={100}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="motivo-reparacion">
            Motivo o detalle de la reparación
          </label>

          <textarea
            id="motivo-reparacion"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Describí brevemente la falla resuelta..."
            disabled={guardando}
            maxLength={300}
            required
          />
        </div>

        <button
          type="submit"
          className="boton-enviar"
          disabled={
            guardando ||
            cargando ||
            !repuestoActual ||
            tieneReservasSimuladas
          }
        >
          {guardando
            ? "Registrando consumo..."
            : "Descontar repuestos del stock físico"}
        </button>
      </form>

      <div className="historial-usos-seccion">
        <h3 className="historial-usos-titulo">
          Usos registrados recientemente
        </h3>

        {cargandoHistorial && (
          <p className="no-items-msg">
            Cargando historial...
          </p>
        )}

        {errorHistorial && (
          <p className="alerta-error" role="alert">
            {errorHistorial}
          </p>
        )}

        {!cargandoHistorial &&
          !errorHistorial &&
          historialUsos.length === 0 && (
            <p className="no-items-msg">
              Todavía no hay consumos registrados.
            </p>
          )}

        <div className="historial-usos-lista">
          {historialUsos.map((item) => (
            <div key={item.id} className="uso-card">
              <div className="uso-card-header">
                <strong>{item.maquina}</strong>
                <span>{formatearFecha(item.fecha)}</span>
              </div>

              <div className="uso-card-consumo">
                Consumo:{" "}
                <strong>
                  {item.cantidad} {item.unidad}
                </strong>{" "}
                de {item.repuestoNombre} ({item.codigo})
              </div>

              {item.ordenTrabajo && (
                <small className="uso-card-motivo">
                  Orden: {item.ordenTrabajo}
                </small>
              )}

              <small className="uso-card-motivo">
                {item.motivo}
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

