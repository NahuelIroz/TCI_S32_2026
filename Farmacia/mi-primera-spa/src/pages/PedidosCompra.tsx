import { useState } from "react";
import { repuestos, type Repuesto } from "../data/repuestos";
import {
  pedidosCompraIniciales,
  type PedidoCompraItem,
  type PrioridadPedido,
} from "../data/pedidosCompraData";
import { servicioNotificaciones } from "../services/notificacionesService";
import { trazabilidadInicial } from "../data/trazabilidadData";
import "./styles.css";

interface PedidosCompraProps {
  onBack?: () => void;
  repuestoInicial?: Repuesto;
}

export default function PedidosCompra({ onBack, repuestoInicial }: PedidosCompraProps) {
  const repuestosCriticos = repuestos.filter(
    (r) => r.disponible <= r.minimo
  );

  const [repuestoId, setRepuestoId] = useState<number>(
    repuestoInicial?.id ?? repuestosCriticos[0]?.id ?? repuestos[0]?.id ?? 1
  );
  const [cantidad, setCantidad] = useState<number>(
    repuestoInicial ? Math.max(repuestoInicial.minimo * 2 - repuestoInicial.disponible, 5) : 10
  );
  const [prioridad, setPrioridad] = useState<PrioridadPedido>(
    repuestoInicial?.disponible === 0 ? "Urgente" : "Media"
  );
  const [justificacion, setJustificacion] = useState<string>(
    repuestoInicial
      ? `Faltante detectado (RN-03): Stock físico en ${repuestoInicial.disponible} ${repuestoInicial.unidad} sobre umbral mínimo de ${repuestoInicial.minimo} ${repuestoInicial.unidad}.`
      : "Stock por debajo del mínimo de seguridad para mantenimiento preventivo."
  );
  const [mensajeExito, setMensajeExito] = useState<string>("");

  const [pedidos, setPedidos] = useState<PedidoCompraItem[]>(pedidosCompraIniciales);

  const repuestoActual = repuestos.find((r) => r.id === repuestoId);

  const handleSeleccionarCritico = (rep: Repuesto) => {
    setRepuestoId(rep.id);
    const sugerido = Math.max(rep.minimo * 2 - rep.disponible, 5);
    setCantidad(sugerido);
    setPrioridad(rep.disponible === 0 ? "Urgente" : "Media");
    setJustificacion(
      `Faltante detectado (RN-03): stock actual de ${rep.disponible} ${rep.unidad} (mínimo de seguridad: ${rep.minimo} ${rep.unidad}).`
    );
    setMensajeExito("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!repuestoActual) return;
    if (cantidad <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    const nuevoPedido: PedidoCompraItem = {
      id: `PED-2026-0${pedidos.length + 13}`,
      codigo: repuestoActual.codigo,
      repuestoNombre: repuestoActual.nombre,
      cantidad,
      unidad: repuestoActual.unidad,
      prioridad,
      justificacion,
      estado: "Pendiente de aprobación",
      fecha: "Hoy",
      solicitante: "Carlos Gómez (Mantenimiento)",
      montoEstimado: cantidad * 12500,
      proveedor: "Proveedor Homologado Planta",
      notificacionLeida: false,
    };

    setPedidos([nuevoPedido, ...pedidos]);
    pedidosCompraIniciales.unshift(nuevoPedido);


    trazabilidadInicial.push({
      id: `TRZ-0${trazabilidadInicial.length + 10}`,
      repuestoCodigo: repuestoActual.codigo,
      repuestoNombre: repuestoActual.nombre,
      tipo: "compra",
      titulo: `Solicitud de Compra ${prioridad === "Urgente" ? "(Urgente)" : ""}`,
      fecha: new Date().toLocaleDateString("es-AR") + " " + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      referencia: nuevoPedido.id,
      cantidad,
      unidad: repuestoActual.unidad,
      usuario: "Carlos Gómez (Mantenimiento)",
      detalles: `Pedido generado por faltante / umbral (RN-03). Justificación: ${justificacion}`,
    });

    servicioNotificaciones.enviarNotificacion(
      "solicitud_compra",
      `🚨 PEDIDO RN-04 [${prioridad.toUpperCase()}]: Compra solicitada para ${repuestoActual.nombre}`,
      [
        "encargado.manana@planta.farmacia.com",
        "encargado.tarde@planta.farmacia.com",
        "encargado.noche@planta.farmacia.com",
        "gerencia@planta.farmacia.com",
      ],
      `Se generó ${nuevoPedido.id} para ${cantidad} ${repuestoActual.unidad} de ${repuestoActual.nombre} con grado de urgencia ${prioridad}. Enviado a encargados de todos los turnos y gerencia (RN-04).`
    );

    setMensajeExito(
      `✓ Pedido ${nuevoPedido.id} generado exitosamente (RN-03). Se notificó con urgencia "${prioridad}" a los encargados de turno Mañana, Tarde, Noche y a la Gerencia (RN-04).`
    );
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
        <h1>Reportar faltantes y compras</h1>
      </header>

      <div className="incidencia-form">
        <div className="subpantalla-encabezado">
          <span className="badge-seccion violeta">
            RN-03 · RN-04 · Faltante y Urgencia
          </span>
          <p className="subpantalla-descripcion">
            Reportá faltantes y generá pedidos de compra. La solicitud se despacha con su grado de urgencia a encargados de todos los turnos y a gerencia.
          </p>
        </div>

        {repuestosCriticos.length > 0 && (
          <div className="compras-criticos-box">
            <strong className="compras-criticos-titulo">
              ⚠️ Repuestos con stock bajo o agotado (RN-02: Umbral alcanzado)
            </strong>
            <div className="compras-criticos-lista">
              {repuestosCriticos.map((rep) => (
                <div key={rep.id} className="compras-critico-item">
                  <div>
                    <strong>{rep.codigo}</strong>: {rep.nombre}{" "}
                    <span
                      className={`stock-critico-alerta ${
                        rep.disponible === 0 ? "agotado" : "bajo"
                      }`}
                    >
                      ({rep.disponible} de {rep.minimo} {rep.unidad})
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-pedir-rapido"
                    onClick={() => handleSeleccionarCritico(rep)}
                  >
                    + Pedir compra (RN-03)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {mensajeExito && (
          <div className="alerta-exito" role="status">
            <strong>{mensajeExito}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} className="formulario-sub-limpio">
          <div className="campo">
            <label htmlFor="repuesto-compra">Repuesto a solicitar</label>
            <select
              id="repuesto-compra"
              className="input-formulario"
              value={repuestoId}
              onChange={(e) => setRepuestoId(Number(e.target.value))}
            >
              {repuestos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.codigo} - {r.nombre} (Stock actual: {r.disponible} {r.unidad} | Mínimo: {r.minimo} {r.unidad})
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="cantidad-compra">Cantidad requerida</label>
            <input
              id="cantidad-compra"
              type="number"
              min={1}
              className="input-formulario"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="prioridad-compra">Grado de urgencia (RN-04)</label>
            <select
              id="prioridad-compra"
              className="input-formulario"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as PrioridadPedido)}
            >
              <option value="Urgente">🚨 Urgente (Máquina detenida o riesgo inminente de parada)</option>
              <option value="Media">⚠️ Normal / Media (Stock bajo próximo a quebrar)</option>
              <option value="Baja">🟢 Baja (Reposición programada estándar)</option>
            </select>
            <small className="campo-ayuda">
              Se enviará automáticamente por correo a los turnos Mañana, Tarde y Noche, y a Gerencia.
            </small>
          </div>

          <div className="campo">
            <label htmlFor="justificacion-compra">Justificación técnica del pedido</label>
            <textarea
              id="justificacion-compra"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Detallá por qué se solicita este material y para qué equipos..."
              required
            />
          </div>

          <button type="submit" className="boton-enviar">
            Enviar Pedido de Compra 
          </button>
        </form>

        <div className="historial-pedidos-seccion">
          <h3 className="historial-pedidos-titulo">Pedidos de compra registrados</h3>
          <div className="pedidos-lista">
            {pedidos.slice(0, 3).map((p) => (
              <div key={p.id} className="pedido-card">
                <div className="pedido-header">
                  <div>
                    <span className="pedido-id">{p.id}</span>
                    <span className="pedido-sku">{p.codigo}</span>
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
                <h4 className="pedido-titulo">{p.repuestoNombre}</h4>
                <div className="pedido-justificacion">
                  <span>
                    Cantidad: <strong>{p.cantidad} {p.unidad}</strong>
                  </span>
                  <span> · Fecha: {p.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
