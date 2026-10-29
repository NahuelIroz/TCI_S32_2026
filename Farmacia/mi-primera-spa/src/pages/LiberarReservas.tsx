import { useState } from "react";
import {
  reservasIniciales,
  type ReservaRepuesto,
} from "../data/reservas";
import { servicioNotificaciones } from "../services/notificacionesService";
import { trazabilidadInicial } from "../data/trazabilidadData";
import "./styles.css";

interface LiberarReservasProps {
  onBack?: () => void;
}

export default function LiberarReservas({ onBack }: LiberarReservasProps) {
  const [reservas, setReservas] = useState<ReservaRepuesto[]>(reservasIniciales);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaRepuesto | null>(null);
  const [motivoLiberacion, setMotivoLiberacion] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const handleAutorizar = (reserva: ReservaRepuesto) => {
    setReservaSeleccionada(reserva);
    setMotivoLiberacion(`Liberación autorizada para orden de intervención inmediata en ${reserva.maquina}.`);
  };

  const handleConfirmarLiberacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaSeleccionada) return;

    setReservas((prev) =>
      prev.map((r) =>
        r.id === reservaSeleccionada.id
          ? {
              ...r,
              estado: "Liberada",
              motivoLiberacion,
              fechaLiberacion: "Hoy",
            }
          : r
      )
    );

    // Actualizar globalmente
    const gIndex = reservasIniciales.findIndex((r) => r.id === reservaSeleccionada.id);
    if (gIndex !== -1) {
      reservasIniciales[gIndex].estado = "Liberada";
      reservasIniciales[gIndex].motivoLiberacion = motivoLiberacion;
      reservasIniciales[gIndex].fechaLiberacion = "Hoy";
    }

    // RN-06: Trazabilidad
    trazabilidadInicial.push({
      id: `TRZ-0${trazabilidadInicial.length + 10}`,
      repuestoCodigo: reservaSeleccionada.repuestoCodigo,
      repuestoNombre: reservaSeleccionada.repuestoNombre,
      tipo: "reserva",
      titulo: "Liberación Autorizada por Encargado (RN-05)",
      fecha: new Date().toLocaleDateString("es-AR") + " " + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      referencia: reservaSeleccionada.codigo,
      cantidad: reservaSeleccionada.cantidad,
      unidad: reservaSeleccionada.unidad,
      usuario: "Ing. Martín Bianchi (Encargado)",
      detalles: `Autorización formal: ${motivoLiberacion}. Impacto: Se reprograma preventivo de ${reservaSeleccionada.maquina}.`,
      maquina: reservaSeleccionada.maquina,
    });

    // RN-05 & RN-09: Aviso inmediato del cambio y su impacto sobre lo planificado
    servicioNotificaciones.enviarNotificacion(
      "liberacion_reserva",
      `⚠️ AVISO RN-05: Liberación autorizada de ${reservaSeleccionada.repuestoNombre} (${reservaSeleccionada.codigo})`,
      [
        "encargado.manana@planta.farmacia.com",
        "encargado.tarde@planta.farmacia.com",
        "encargado.noche@planta.farmacia.com",
        "mantenimiento@planta.farmacia.com",
      ],
      `El Encargado autorizó la liberación de ${reservaSeleccionada.cantidad} ${reservaSeleccionada.unidad} reservadas para ${reservaSeleccionada.maquina}. Motivo: "${motivoLiberacion}". Impacto: Mantenimiento preventivo planificado queda sujeto a reposición.`
    );

    setMensajeExito(
      `✓ Reserva ${reservaSeleccionada.codigo} autorizada por Encargado (RN-05). Se notificó de inmediato a todos los turnos sobre el impacto en lo planificado (RN-09).`
    );
    setReservaSeleccionada(null);
    setMotivoLiberacion("");
  };

  const reservasActivas = reservas.filter((r) => r.estado === "Activa");
  const reservasLiberadas = reservas.filter((r) => r.estado === "Liberada");

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
        <h1>Liberación de Repuestos Reservados</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado">
          <span className="badge-seccion verde">Administrar · RN-05</span>
          <p className="subpantalla-descripcion">
            Autorizá formalmente la salida de repuestos críticos retenidos para paradas de planta programadas.
          </p>
        </div>

        {mensajeExito && (
          <div className="feedback-banner feedback-banner-success" role="status">
            {mensajeExito}
          </div>
        )}

        {reservaSeleccionada && (
          <form className="formulario-delegar-tarea" onSubmit={handleConfirmarLiberacion}>
            <h3>Confirmar Autorización de Liberación</h3>
            <p className="modal-subtexto">
              Estás a punto de desbloquear <strong>{reservaSeleccionada.cantidad} {reservaSeleccionada.unidad}</strong> de{" "}
              <strong>{reservaSeleccionada.repuestoNombre}</strong> ({reservaSeleccionada.codigo}).
            </p>

            <div className="form-group">
              <label htmlFor="motivoLib">Justificación de la liberación técnica (RN-05)</label>
              <textarea
                id="motivoLib"
                rows={3}
                value={motivoLiberacion}
                onChange={(e) => setMotivoLiberacion(e.target.value)}
                required
              />
            </div>

            <div className="form-botones-fila">
              <button
                type="button"
                className="boton-cancelar"
                onClick={() => setReservaSeleccionada(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="boton-enviar">
                Confirmar y Firmar Liberación
              </button>
            </div>
          </form>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Reservas Activas</span>
            <strong className="kpi-value text-amber">{reservasActivas.length}</strong>
            <span className="kpi-desc">Piezas retenidas en depósito</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Liberadas Hoy</span>
            <strong className="kpi-value text-green">{reservasLiberadas.length}</strong>
            <span className="kpi-desc">Disponibles para entrega técnica</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Protocolo de Control</span>
            <strong className="kpi-value text-blue">RN-05</strong>
            <span className="kpi-desc">Firma digital de Encargado</span>
          </div>
        </div>

        <div className="pedidos-lista">
          {reservas.map((res) => (
            <div key={res.id} className="pedido-card">
              <div className="pedido-header">
                <div>
                  <span className="pedido-id">{res.codigo}</span>
                  <span className="pedido-sku">{res.repuestoCodigo}</span>
                </div>
                <div>
                  <span
                    className={`badge-estado-pedido ${
                      res.estado === "Activa"
                        ? "badge-pendiente"
                        : res.estado === "Liberada"
                        ? "badge-aprobado"
                        : "badge-cotizacion"
                    }`}
                  >
                    {res.estado === "Activa"
                      ? "🔒 Retenida (Activa)"
                      : res.estado === "Liberada"
                      ? "✓ Liberada"
                      : "Consumida"}
                  </span>
                </div>
              </div>

              <h3 className="pedido-titulo">{res.repuestoNombre}</h3>

              <div className="pedido-detalles-grid">
                <div>
                  <span className="detalle-rotulo">Cantidad retenida:</span>
                  <span className="detalle-valor">
                    {res.cantidad} {res.unidad}
                  </span>
                </div>
                <div>
                  <span className="detalle-rotulo">Equipo de destino:</span>
                  <span className="detalle-valor">{res.maquina}</span>
                </div>
                <div>
                  <span className="detalle-rotulo">Solicitante:</span>
                  <span className="detalle-valor">{res.solicitante}</span>
                </div>
                <div>
                  <span className="detalle-rotulo">Fecha programada:</span>
                  <span className="detalle-valor">{res.fechaProgramada}</span>
                </div>
              </div>

              <p className="pedido-justificacion">
                <strong>Motivo de la reserva:</strong> {res.motivo}
              </p>

              {res.motivoLiberacion && (
                <p className="reserva-nota-liberacion">
                  <strong>Autorización técnica:</strong> {res.motivoLiberacion} (
                  {res.fechaLiberacion})
                </p>
              )}

              <div className="pedido-acciones">
                {res.estado === "Activa" ? (
                  <button
                    type="button"
                    className="btn-accion btn-aprobar"
                    onClick={() => handleAutorizar(res)}
                  >
                    🔓 Autorizar Liberación Inmediata
                  </button>
                ) : (
                  <span className="estado-finalizado-label">
                    {res.estado === "Liberada"
                      ? "✓ Pieza autorizada para retiro en mostrador"
                      : "Pieza instalada y consumida en máquina"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

