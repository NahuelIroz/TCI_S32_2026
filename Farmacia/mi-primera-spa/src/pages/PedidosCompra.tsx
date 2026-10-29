import { useState } from "react";
import { repuestos, type Repuesto } from "../data/repuestos";
import "./styles.css";

interface PedidosCompraProps {
  onBack?: () => void;
  repuestoInicial?: Repuesto;
}

interface PedidoCompra {
  id: string;
  codigo: string;
  repuestoNombre: string;
  cantidad: number;
  unidad: string;
  prioridad: "Baja" | "Media" | "Urgente";
  justificacion: string;
  estado: "Pendiente de aprobación" | "En cotización" | "Aprobado";
  fecha: string;
}

export default function PedidosCompra({ onBack, repuestoInicial }: PedidosCompraProps) {
  // Lista de repuestos que tienen stock bajo o agotado
  const repuestosCriticos = repuestos.filter(
    (r) => r.disponible <= r.minimo
  );

  const [repuestoId, setRepuestoId] = useState<number>(
    repuestoInicial?.id ?? repuestosCriticos[0]?.id ?? repuestos[0]?.id ?? 1
  );
  const [cantidad, setCantidad] = useState<number>(10);
  const [prioridad, setPrioridad] = useState<"Baja" | "Media" | "Urgente">("Media");
  const [justificacion, setJustificacion] = useState<string>(
    "Stock por debajo del mínimo de seguridad para mantenimiento preventivo."
  );
  const [mensajeExito, setMensajeExito] = useState<string>("");

  const [pedidos, setPedidos] = useState<PedidoCompra[]>([
    {
      id: "PED-2026-012",
      codigo: "SKU-COR-900",
      repuestoNombre: "Correa Dentada Sincrónica 8M",
      cantidad: 5,
      unidad: "unid.",
      prioridad: "Urgente",
      justificacion: "Stock agotado (0 unid.), requerida para compresores principales.",
      estado: "Pendiente de aprobación",
      fecha: "Ayer",
    },
    {
      id: "PED-2026-011",
      codigo: "SKU-VLV-420",
      repuestoNombre: "Válvula Solenoide Festo 24V DC 5/2",
      cantidad: 10,
      unidad: "unid.",
      prioridad: "Media",
      justificacion: "Stock crítico (2 unid. restantes sobre mínimo de 5).",
      estado: "En cotización",
      fecha: "26/10/2026",
    },
  ]);

  const repuestoActual = repuestos.find((r) => r.id === repuestoId);

  const handleSeleccionarCritico = (rep: Repuesto) => {
    setRepuestoId(rep.id);
    const sugerido = Math.max(rep.minimo * 2 - rep.disponible, 5);
    setCantidad(sugerido);
    setPrioridad(rep.disponible === 0 ? "Urgente" : "Media");
    setJustificacion(
      `Faltante detectado: stock actual de ${rep.disponible} ${rep.unidad} (mínimo de seguridad: ${rep.minimo} ${rep.unidad}).`
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

    const nuevoPedido: PedidoCompra = {
      id: `PED-2026-0${pedidos.length + 13}`,
      codigo: repuestoActual.codigo,
      repuestoNombre: repuestoActual.nombre,
      cantidad,
      unidad: repuestoActual.unidad,
      prioridad,
      justificacion,
      estado: "Pendiente de aprobación",
      fecha: "Hoy",
    };

    setPedidos([nuevoPedido, ...pedidos]);
    setMensajeExito(
      `¡Pedido ${nuevoPedido.id} generado exitosamente! Se solicitaron ${cantidad} ${repuestoActual.unidad} de ${repuestoActual.nombre}.`
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
            Operar Stock · Solicitudes de Compra
          </span>
          <p className="subpantalla-descripcion">
            Reportá repuestos faltantes o con stock por debajo del punto de pedido y generá la orden de compra correspondiente.
          </p>
        </div>

        {repuestosCriticos.length > 0 && (
          <div className="compras-criticos-box">
            <strong className="compras-criticos-titulo">
              ⚠️ Repuestos con stock bajo o agotado ({repuestosCriticos.length})
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
                    + Pedir compra
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {mensajeExito && (
          <div className="alerta-exito">
            <strong>{mensajeExito}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} className="incidencia-form" style={{ padding: 0 }}>
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
                  {r.codigo} - {r.nombre} (Actual: {r.disponible} {r.unidad} | Mínimo: {r.minimo} {r.unidad})
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="cantidad-compra">Cantidad a pedir</label>
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
            <label htmlFor="prioridad-compra">Prioridad del pedido</label>
            <select
              id="prioridad-compra"
              className="input-formulario"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as "Baja" | "Media" | "Urgente")}
            >
              <option value="Baja">Baja (reposición habitual)</option>
              <option value="Media">Media (cerca de nivel mínimo)</option>
              <option value="Urgente">Alta / Urgente (máquina parada o stock en 0)</option>
            </select>
          </div>

          <div className="campo">
            <label htmlFor="justificacion-compra">Motivo / Justificación</label>
            <textarea
              id="justificacion-compra"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Explicá la urgencia o detalle del pedido..."
            />
          </div>

          <button type="submit" className="boton-enviar boton-comprar-enviar">
            🛒 Generar pedido de compra
          </button>
        </form>

        <div className="historial-pedidos-box">
          <h3 className="historial-pedidos-titulo">
            Pedidos de compra generados
          </h3>
          <div className="historial-pedidos-lista">
            {pedidos.map((ped) => (
              <div key={ped.id} className="pedido-card">
                <div className="pedido-card-header">
                  <strong>{ped.id}</strong>
                  <span
                    className={`pedido-prioridad-badge ${
                      ped.prioridad === "Urgente"
                        ? "urgente"
                        : ped.prioridad === "Media"
                        ? "media"
                        : "baja"
                    }`}
                  >
                    {ped.prioridad}
                  </span>
                </div>
                <div className="pedido-card-detalle">
                  <strong>{ped.cantidad} {ped.unidad}</strong> de {ped.repuestoNombre} ({ped.codigo})
                </div>
                <div className="pedido-card-footer">
                  <span>Estado: <strong>{ped.estado}</strong></span>
                  <span>{ped.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
