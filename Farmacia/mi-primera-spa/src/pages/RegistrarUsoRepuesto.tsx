import { useState } from "react";
import { repuestos, type Repuesto } from "../data/repuestos";
import "./styles.css";

interface RegistrarUsoRepuestoProps {
  onBack?: () => void;
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
}

export default function RegistrarUsoRepuesto({ onBack }: RegistrarUsoRepuestoProps) {
  const [listaRepuestos, setListaRepuestos] = useState<Repuesto[]>(repuestos);
  const [maquina, setMaquina] = useState<string>("Compresor 1 (M-001)");
  const [repuestoId, setRepuestoId] = useState<number>(listaRepuestos[0]?.id ?? 1);
  const [cantidad, setCantidad] = useState<number>(1);
  const [motivo, setMotivo] = useState<string>("Cambio preventivo por vibración y desgaste");
  const [ordenTrabajo, setOrdenTrabajo] = useState<string>("OT-2026-089");
  const [mensajeExito, setMensajeExito] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [historialUsos, setHistorialUsos] = useState<RegistroUso[]>([
    {
      id: 1,
      maquina: "Bomba hidráulica (M-003)",
      repuestoNombre: "Filtro de Aire Compresor Atlas Copco",
      codigo: "SKU-FLT-880",
      cantidad: 2,
      unidad: "unid.",
      motivo: "Reemplazo de filtro saturado",
      fecha: "Hoy, 14:30",
    },
  ]);

  const repuestoActual = listaRepuestos.find((r) => r.id === repuestoId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!repuestoActual) return;

    if (cantidad <= 0) {
      setError("La cantidad utilizada debe ser mayor a 0.");
      return;
    }

    if (cantidad > repuestoActual.disponible) {
      setError(
        `Stock insuficiente. Hay ${repuestoActual.disponible} ${repuestoActual.unidad} disponibles y solicitás descontar ${cantidad}.`
      );
      return;
    }

    const nuevoStock = repuestoActual.disponible - cantidad;
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

    // Actualizar catálogo global
    const globalIndex = repuestos.findIndex((r) => r.id === repuestoActual.id);
    if (globalIndex !== -1) {
      repuestos[globalIndex].disponible = nuevoStock;
      repuestos[globalIndex].estado = nuevoEstado;
    }

    
    const nuevoRegistro: RegistroUso = {
      id: Date.now(),
      maquina,
      repuestoNombre: repuestoActual.nombre,
      codigo: repuestoActual.codigo,
      cantidad,
      unidad: repuestoActual.unidad,
      motivo,
      fecha: "Recién",
    };

    setHistorialUsos([nuevoRegistro, ...historialUsos]);
    setMensajeExito(
      `✓ Se registraron y descontaron ${cantidad} ${repuestoActual.unidad} de ${repuestoActual.nombre} para ${maquina}. Stock restante: ${nuevoStock} ${repuestoActual.unidad}.`
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
        <h1>Registrar repuestos en reparación</h1>
      </header>

      <form className="incidencia-form" onSubmit={handleSubmit}>
        <div className="subpantalla-encabezado">
          <span className="badge-seccion naranja">
            Operar Stock · Consumo en Reparación
          </span>
          <p className="subpantalla-descripcion">
            Indicá qué repuestos y qué cantidades utilizaste para completar la reparación. El sistema descontará automáticamente el stock disponible.
          </p>
        </div>

        {error && (
          <div className="alerta-error">
            ⚠️ {error}
          </div>
        )}

        {mensajeExito && (
          <div className="alerta-exito">
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
            <option>Compresor 1 (M-001)</option>
            <option>Compresor 2 (M-002)</option>
            <option>Bomba hidráulica (M-003)</option>
            <option>Fraccionadora 2 (M-004)</option>
            <option>Envasadora automática (M-005)</option>
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
            }}
          >
            {listaRepuestos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.codigo} - {r.nombre} (Disponible: {r.disponible} {r.unidad})
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
              <span>Stock disponible: </span>
              <strong
                className={
                  repuestoActual.disponible === 0
                    ? "stock-numero-agotado"
                    : repuestoActual.disponible <= repuestoActual.minimo
                    ? "stock-numero-bajo"
                    : "actual"
                }
              >
                {repuestoActual.disponible} {repuestoActual.unidad}
              </strong>
            </div>
          </div>
        )}

        <div className="campo">
          <label htmlFor="cantidad-usada">Cantidad de repuestos consumidos</label>
          <input
            id="cantidad-usada"
            type="number"
            min={1}
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
          Descontar repuestos y registrar uso
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
              </div>
              <small className="uso-card-motivo">{item.motivo}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
