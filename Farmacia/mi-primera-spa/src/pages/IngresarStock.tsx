import { useState } from "react";
import { repuestos, type Repuesto } from "../data/repuestos";
import "./styles.css";

interface IngresarStockProps {
  onBack?: () => void;
}

export default function IngresarStock({ onBack }: IngresarStockProps) {
  const [listaRepuestos, setListaRepuestos] = useState<Repuesto[]>(repuestos);
  const [repuestoSeleccionadoId, setRepuestoSeleccionadoId] = useState<number>(
    listaRepuestos[0]?.id ?? 1
  );
  const [cantidad, setCantidad] = useState<number>(5);
  const [remito, setRemito] = useState<string>("REM-2026-0045");
  const [ubicacion, setUbicacion] = useState<string>(
    listaRepuestos[0]?.ubicacion ?? "Pasillo A · Estante 1"
  );
  const [proveedor, setProveedor] = useState<string>("Distribuidora Industrial S.A.");
  const [observaciones, setObservaciones] = useState<string>("");
  const [mensajeExito, setMensajeExito] = useState<string>("");

  const repuestoActual = listaRepuestos.find(
    (r) => r.id === repuestoSeleccionadoId
  );

  const handleRepuestoChange = (id: number) => {
    setRepuestoSeleccionadoId(id);
    const encontrado = listaRepuestos.find((r) => r.id === id);
    if (encontrado) {
      setUbicacion(encontrado.ubicacion);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cantidad <= 0) {
      alert("La cantidad a ingresar debe ser mayor a 0");
      return;
    }

    if (!repuestoActual) return;

    const nuevoStock = repuestoActual.disponible + cantidad;
    const nuevoEstado =
      nuevoStock === 0
        ? "Agotado"
        : nuevoStock <= repuestoActual.minimo
        ? "Stock Bajo"
        : "Disponible";

    setListaRepuestos((prev) =>
      prev.map((r) =>
        r.id === repuestoActual.id
          ? {
              ...r,
              disponible: nuevoStock,
              estado: nuevoEstado,
              ubicacion: ubicacion || r.ubicacion,
            }
          : r
      )
    );

    const globalIndex = repuestos.findIndex((r) => r.id === repuestoActual.id);
    if (globalIndex !== -1) {
      repuestos[globalIndex].disponible = nuevoStock;
      repuestos[globalIndex].estado = nuevoEstado;
      if (ubicacion) repuestos[globalIndex].ubicacion = ubicacion;
    }

    setMensajeExito(
      `¡Ingreso confirmado! Se sumaron ${cantidad} ${repuestoActual.unidad} a ${repuestoActual.nombre}. Nuevo stock: ${nuevoStock} ${repuestoActual.unidad}.`
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
        <h1>Ingresar repuestos al almacén</h1>
      </header>

      <form className="incidencia-form" onSubmit={handleSubmit}>
        <div className="subpantalla-encabezado">
          <span className="badge-seccion verde">
            Operar Stock · Recepción
          </span>
          <p className="subpantalla-descripcion">
            Registrá la entrada física de repuestos recibidos al almacén de mantenimiento.
          </p>
        </div>

        {mensajeExito && (
          <div className="alerta-exito">
            <strong>✓ Operación exitosa:</strong> {mensajeExito}
          </div>
        )}

        <div className="campo">
          <label htmlFor="repuesto">Repuesto a ingresar</label>
          <select
            id="repuesto"
            className="input-formulario"
            value={repuestoSeleccionadoId}
            onChange={(e) => handleRepuestoChange(Number(e.target.value))}
          >
            {listaRepuestos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.codigo} - {r.nombre} (Stock actual: {r.disponible} {r.unidad})
              </option>
            ))}
          </select>
        </div>

        {repuestoActual && (
          <div className="repuesto-info-box">
            <div className="repuesto-info-col">
              <span>Stock disponible:</span>
              <strong className="stock-positivo">
                {repuestoActual.disponible} {repuestoActual.unidad}
              </strong>
            </div>
            <div className="repuesto-info-col">
              <span>Stock mínimo:</span>
              <strong>
                {repuestoActual.minimo} {repuestoActual.unidad}
              </strong>
            </div>
          </div>
        )}

        <div className="campo">
          <label htmlFor="cantidad">Cantidad recibida a ingresar</label>
          <input
            id="cantidad"
            type="number"
            min={1}
            className="input-formulario"
            value={cantidad}
            onChange={(e) => {
              setCantidad(Number(e.target.value));
              setMensajeExito("");
            }}
            placeholder="Ej: 10"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="ubicacion">Ubicación física en el almacén</label>
          <input
            id="ubicacion"
            type="text"
            className="input-formulario"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej: Pasillo A · Estante 2 (Nivel 1)"
          />
        </div>

        <div className="campo">
          <label htmlFor="remito">N° de remito o factura</label>
          <input
            id="remito"
            type="text"
            className="input-formulario"
            value={remito}
            onChange={(e) => setRemito(e.target.value)}
            placeholder="Ej: REM-2026-0045"
          />
        </div>

        <div className="campo">
          <label htmlFor="proveedor">Proveedor de origen</label>
          <input
            id="proveedor"
            type="text"
            className="input-formulario"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            placeholder="Nombre del proveedor"
          />
        </div>

        <div className="campo">
          <label htmlFor="observaciones">Observaciones adicionales</label>
          <textarea
            id="observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Detalles sobre el estado del lote, bultos, etc."
          />
        </div>

        <button type="submit" className="boton-enviar">
          ✓ Confirmar ingreso al almacén
        </button>
      </form>
    </div>
  );
}
