import { useState } from "react";
import { repuestos, type Repuesto } from "../data/repuestos";
import { reservasIniciales } from "../data/reservas";
import { servicioNotificaciones } from "../services/notificacionesService";
import { trazabilidadInicial } from "../data/trazabilidadData";
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
  esConsumoReserva?: boolean;
}

export default function RegistrarUsoRepuesto({
  onBack,
  onGenerarPedidoCompra,
}: RegistrarUsoRepuestoProps) {
  const [listaRepuestos, setListaRepuestos] = useState<Repuesto[]>(repuestos);
  const [maquina, setMaquina] = useState<string>("Envasadora Rotativa #03");
  const [repuestoId, setRepuestoId] = useState<number>(listaRepuestos[0]?.id ?? 1);
  const [cantidad, setCantidad] = useState<number>(1);
  const [motivo, setMotivo] = useState<string>("Cambio correctivo por vibración y desgaste");
  const [ordenTrabajo, setOrdenTrabajo] = useState<string>("OT-2026-089");
  const [mensajeExito, setMensajeExito] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [mostrarBotonCompra, setMostrarBotonCompra] = useState<boolean>(false);

  const [esPreventivoConReserva, setEsPreventivoConReserva] = useState<boolean>(false);
  const [reservaIdSeleccionada, setReservaIdSeleccionada] = useState<number | null>(null);

  const [historialUsos, setHistorialUsos] = useState<RegistroUso[]>([
    {
      id: 1,
      maquina: "Prensa Hidráulica H-12",
      repuestoNombre: "Filtro de Aire Compresor Atlas Copco",
      codigo: "SKU-FLT-880",
      cantidad: 2,
      unidad: "unid.",
      motivo: "Reemplazo de filtro saturado",
      fecha: "Hoy, 14:30",
    },
  ]);

  const repuestoActual = listaRepuestos.find((r) => r.id === repuestoId);

  const reservasActivas = reservasIniciales.filter(
    (res) =>
      res.repuestoCodigo === repuestoActual?.codigo && res.estado === "Activa"
  );
  const totalReservadoActivo = reservasActivas.reduce(
    (acc, curr) => acc + curr.cantidad,
    0
  );
  const stockLibre = Math.max(
    0,
    (repuestoActual?.disponible ?? 0) - totalReservadoActivo
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMostrarBotonCompra(false);

    if (!repuestoActual) return;

    const cantidadEntera = Math.floor(cantidad);
    if (cantidadEntera < 1) {
      setError("RN-01: La cantidad utilizada debe ser un número entero mayor o igual a 1.");
      return;
    }

    if (cantidadEntera > repuestoActual.disponible) {
      setError(
        `RN-01 Rechazado: Stock físico insuficiente. Stock en depósito: ${repuestoActual.disponible} ${repuestoActual.unidad}. Solicitado: ${cantidadEntera}.`
      );
      setMostrarBotonCompra(true);
      return;
    }

    if (!esPreventivoConReserva && cantidadEntera > stockLibre) {
      setError(
        `RN-05 Rechazado: Hay ${totalReservadoActivo} ${repuestoActual.unidad} reservadas para mantenimiento preventivo en ${reservasActivas[0]?.maquina}. Stock libre para otras reparaciones: ${stockLibre} ${repuestoActual.unidad}. Exige autorización del Encargado para liberar reservas.`
      );
      setMostrarBotonCompra(true);
      return;
    }

    const nuevoStock = repuestoActual.disponible - cantidadEntera;
    const nuevoEstado =
      nuevoStock === 0
        ? "Agotado"
        : nuevoStock <= repuestoActual.minimo
        ? "Stock Bajo"
        : "Disponible";

    setListaRepuestos((prev) =>
      prev.map((r) =>
        r.id === repuestoActual.id
          ? { ...r, disponible: nuevoStock, estado: nuevoEstado }
          : r
      )
    );

    const globalIndex = repuestos.findIndex((r) => r.id === repuestoActual.id);
    if (globalIndex !== -1) {
      repuestos[globalIndex].disponible = nuevoStock;
      repuestos[globalIndex].estado = nuevoEstado;
    }

    let detalleReserva = "";
    if (esPreventivoConReserva && reservaIdSeleccionada) {
      const idxRes = reservasIniciales.findIndex((res) => res.id === reservaIdSeleccionada);
      if (idxRes !== -1) {
        reservasIniciales[idxRes].estado = "Consumida";
        reservasIniciales[idxRes].motivoLiberacion = `Consumida en preventivo ${ordenTrabajo}`;
        reservasIniciales[idxRes].fechaLiberacion = "Hoy";
        detalleReserva = ` (Reserva ${reservasIniciales[idxRes].codigo} liberada y consumida en la misma transacción)`;
      }
    }

    trazabilidadInicial.push({
      id: `TRZ-0${trazabilidadInicial.length + 10}`,
      repuestoCodigo: repuestoActual.codigo,
      repuestoNombre: repuestoActual.nombre,
      tipo: "uso",
      titulo: esPreventivoConReserva
        ? "Consumo en Preventivo (RN-10)"
        : "Consumo en Reparación (RN-01)",
      fecha: new Date().toLocaleDateString("es-AR") + " " + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      referencia: ordenTrabajo,
      cantidad: cantidadEntera,
      unidad: repuestoActual.unidad,
      usuario: "Carlos Gómez (Mantenimiento)",
      detalles: `${motivo}. ${detalleReserva}`,
      maquina,
    });

    servicioNotificaciones.enviarNotificacion(
      "cambio_parte",
      `🔧 USO RN-01: ${cantidadEntera} ${repuestoActual.unidad} consumidas en ${maquina}`,
      ["encargados@planta.farmacia.com", "supervisores@planta.farmacia.com"],
      `Orden ${ordenTrabajo}: ${repuestoActual.nombre} (${repuestoActual.codigo}). Stock físico restante: ${nuevoStock} ${repuestoActual.unidad}.${detalleReserva}`
    );

   if (nuevoStock <= repuestoActual.minimo) {
      servicioNotificaciones.enviarNotificacion(
        "alerta_umbral",
        `⚠️ ALERTA RN-02: Stock mínimo alcanzado para ${repuestoActual.nombre}`,
        ["encargados@planta.farmacia.com", "gerencia@planta.farmacia.com", "compras@planta.farmacia.com"],
        `El repuesto ${repuestoActual.codigo} cayó a ${nuevoStock} ${repuestoActual.unidad} (umbral mínimo: ${repuestoActual.minimo}). Se incorporó a la lista de reposición.`
      );
    }

    const nuevoRegistro: RegistroUso = {
      id: Date.now(),
      maquina,
      repuestoNombre: repuestoActual.nombre,
      codigo: repuestoActual.codigo,
      cantidad: cantidadEntera,
      unidad: repuestoActual.unidad,
      motivo,
      fecha: "Recién",
      esConsumoReserva: esPreventivoConReserva,
    };

    setHistorialUsos([nuevoRegistro, ...historialUsos]);
    setMensajeExito(
      `✓ RN-01: Se descontaron ${cantidadEntera} ${repuestoActual.unidad} de ${repuestoActual.nombre} para ${maquina}. Stock físico restante: ${nuevoStock} ${repuestoActual.unidad}.${detalleReserva}`
    );
    setEsPreventivoConReserva(false);
  };

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
          <span className="badge-seccion naranja">
             Descuento y Reservas
          </span>
          <p className="subpantalla-descripcion">
            Descontá del stock físico las partes utilizadas (≥ 1). Los repuestos retenidos por reserva no pueden usarse para otra máquina sin autorización.
          </p>
        </div>

        {error && (
          <div className="alerta-error" role="alert">
            <p>⚠️ {error}</p>
            {mostrarBotonCompra && onGenerarPedidoCompra && repuestoActual && (
              <button
                type="button"
                className="btn-accion btn-cotizar mt-xs"
                onClick={() => onGenerarPedidoCompra(repuestoActual)}
              >
                 Reportar Faltante y Generar Pedido de Compra  →
              </button>
            )}
          </div>
        )}

        {mensajeExito && (
          <div className="alerta-exito" role="status">
            <strong>{mensajeExito}</strong>
          </div>
        )}

        <div className="campo">
          <label htmlFor="maquina">Máquina o Equipo reparado</label>
          <select
            id="maquina"
            className="input-formulario"
            value={maquina}
            onChange={(e) => setMaquina(e.target.value)}
          >
            <option value="Envasadora Rotativa #03">Envasadora Rotativa #03</option>
            <option value="Prensa Hidráulica H-12">Prensa Hidráulica H-12</option>
            <option value="Compresor Central C-01">Compresor Central C-01</option>
            <option value="Blistera Automática #04">Blistera Automática #04</option>
            <option value="Lavadora de Ampollas L-02">Lavadora de Ampollas L-02</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="repuesto-usado">Repuesto utilizado</label>
          <select
            id="repuesto-usado"
            className="input-formulario"
            value={repuestoId}
            onChange={(e) => {
              setRepuestoId(Number(e.target.value));
              setError("");
              setMensajeExito("");
              setMostrarBotonCompra(false);
            }}
          >
            {listaRepuestos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.codigo} - {r.nombre} (Stock Físico: {r.disponible} {r.unidad})
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
              <span>Stock Libre (sin reserva): </span>
              <strong className={stockLibre === 0 ? "text-red" : "text-green"}>
                {stockLibre} {repuestoActual.unidad}
              </strong>
            </div>
            <div>
              <span>Umbral Mínimo (RN-02): </span>
              <strong>{repuestoActual.minimo} {repuestoActual.unidad}</strong>
            </div>
          </div>
        )}

        {reservasActivas.length > 0 && (
          <div className="tablero-bloque mt-sm">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={esPreventivoConReserva}
                onChange={(e) => {
                  setEsPreventivoConReserva(e.target.checked);
                  if (e.target.checked && reservasActivas[0]) {
                    setReservaIdSeleccionada(reservasActivas[0].id);
                    setMaquina(reservasActivas[0].maquina);
                  }
                }}
              />
              <strong> Ejecutar mantenimiento preventivo planificado</strong>
            </label>

            {esPreventivoConReserva && (
              <div className="form-group mt-xs">
                <label htmlFor="reservaSelect">Reserva a consumir y liberar en la transacción:</label>
                <select
                  id="reservaSelect"
                  value={reservaIdSeleccionada ?? ""}
                  onChange={(e) => setReservaIdSeleccionada(Number(e.target.value))}
                >
                  {reservasActivas.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.codigo} — {r.cantidad} {r.unidad} para {r.maquina} ({r.motivo})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="campo">
          <label htmlFor="cantidad-usada">Cantidad consumida (Entera ≥ 1, RN-01)</label>
          <input
            id="cantidad-usada"
            type="number"
            min={1}
            step={1}
            max={repuestoActual?.disponible ?? 1}
            className="input-formulario"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="orden-trabajo">N° Orden de Trabajo / Reparación</label>
          <input
            id="orden-trabajo"
            type="text"
            className="input-formulario"
            value={ordenTrabajo}
            onChange={(e) => setOrdenTrabajo(e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="motivo-reparacion">Motivo o detalle de la reparación</label>
          <textarea
            id="motivo-reparacion"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Describí brevemente la falla resuelta..."
          />
        </div>

        <button type="submit" className="boton-enviar">
          Descontar repuestos del stock físico 
        </button>
      </form>

      <div className="historial-usos-seccion">
        <h3 className="historial-usos-titulo">
          Usos registrados recientemente
        </h3>
        <div className="historial-usos-lista">
          {historialUsos.map((item) => (
            <div key={item.id} className="uso-card">
              <div className="uso-card-header">
                <strong>{item.maquina}</strong>
                <span>{item.fecha}</span>
              </div>
              <div className="uso-card-consumo">
                Consumo: <strong>{item.cantidad} {item.unidad}</strong> de {item.repuestoNombre} ({item.codigo})
                {item.esConsumoReserva && (
                  <span className="badge-estado-pedido badge-aprobado ml-xs">
                     Consumo de Reserva
                  </span>
                )}
              </div>
              <small className="uso-card-motivo">{item.motivo}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
