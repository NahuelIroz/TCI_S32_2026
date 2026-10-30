import { useState } from "react";
import { repuestos, type Repuesto } from "../data/repuestos";
import { trazabilidadInicial } from "../data/trazabilidadData";
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
  const [listaRepuestos, setListaRepuestos] = useState<Repuesto[]>(repuestos);
  const [repuestoSeleccionadoId, setRepuestoSeleccionadoId] = useState<number>(
    listaRepuestos[0]?.id ?? 1
  );
  const [cantidad, setCantidad] = useState<number>(5);
  const [remito, setRemito] = useState<string>("REM-2026-0045");
  const [ubicacion, setUbicacion] = useState<string>(
    listaRepuestos[0]?.ubicacion ?? "Pasillo A · Estante 1 (Nivel 2)"
  );
  const [proveedor, setProveedor] = useState<string>("Distribuidora Industrial S.A.");
  const [tecnicoDelegado, setTecnicoDelegado] = useState<string>("Carlos Gómez (Mantenimiento)");
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

    const cantidadEntera = Math.floor(cantidad);
    const nuevoStock = repuestoActual.disponible + cantidadEntera;
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

    trazabilidadInicial.push({
      id: `TRZ-0${trazabilidadInicial.length + 10}`,
      repuestoCodigo: repuestoActual.codigo,
      repuestoNombre: repuestoActual.nombre,
      tipo: "recepcion",
      titulo: "Recepción de Compra (RN-08)",
      fecha: new Date().toLocaleDateString("es-AR") + " " + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      referencia: remito,
      cantidad: cantidadEntera,
      unidad: repuestoActual.unidad,
      usuario: tecnicoDelegado,
      detalles: `Recepción de compra proveedor ${proveedor}. Ubicación: ${ubicacion}.`,
      ubicacion,
    });

    servicioNotificaciones.enviarNotificacion(
      "cambio_parte",
      `CARGA RN-08: ${cantidadEntera} ${repuestoActual.unidad} recibidas de ${repuestoActual.nombre}`,
      ["encargados@planta.farmacia.com", "compras@planta.farmacia.com"],
      `Remito ${remito}: Se cargó stock físico en ${ubicacion}. Tarea delegada a: ${tecnicoDelegado}. Nuevo stock total: ${nuevoStock} ${repuestoActual.unidad}.`
    );

    setMensajeExito(
      `✓ RN-08 Confirmado: Se sumaron ${cantidadEntera} ${repuestoActual.unidad} a ${repuestoActual.nombre}. Ubicación física asignada: "${ubicacion}". Tarea supervisada para ${tecnicoDelegado}. Nuevo stock: ${nuevoStock} ${repuestoActual.unidad}.`
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
        <h1>{titulo}</h1>
      </header>

      <form className="incidencia-form" onSubmit={handleSubmit}>
        <div className="subpantalla-encabezado">
        
          <p className="subpantalla-descripcion">
            Registrá la entrada de mercadería de compras al almacén, actualizá el stock físico, definí la ubicación y delegá la supervisión física.
          </p>
        </div>

        {mensajeExito && (
          <div className="alerta-exito" role="status">
            <strong>{mensajeExito}</strong>
          </div>
        )}

        <div className="campo">
          <label htmlFor="repuesto-select">Repuesto recibido</label>
          <select
            id="repuesto-select"
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
          <label htmlFor="cantidad-input">Cantidad recibida</label>
          <input
            id="cantidad-input"
            type="number"
            min={1}
            step={1}
            className="input-formulario"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="remito-input">N° de Remito / Orden de Compra</label>
          <input
            id="remito-input"
            type="text"
            className="input-formulario"
            value={remito}
            onChange={(e) => setRemito(e.target.value)}
            placeholder="Ej. REM-2026-0045"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="ubicacion-input">Ubicación física en el depósito</label>
          <input
            id="ubicacion-input"
            type="text"
            className="input-formulario"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej. Pasillo A · Estante 2 (Nivel 1)"
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="delegar-input">Delegar y supervisar carga física </label>
          <select
            id="delegar-input"
            className="input-formulario"
            value={tecnicoDelegado}
            onChange={(e) => setTecnicoDelegado(e.target.value)}
          >
            <option value="Carlos Gómez (Mantenimiento)">Carlos Gómez (Mantenimiento)</option>
            <option value="J. Morales (Mantenimiento)">J. Morales (Mantenimiento)</option>
            <option value="M. López (Mantenimiento)">M. López (Mantenimiento)</option>
            <option value="Ing. Martín Bianchi (Encargado)">Ing. Martín Bianchi (Encargado - Directo)</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="proveedor-input">Proveedor / Origen</label>
          <input
            id="proveedor-input"
            type="text"
            className="input-formulario"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="obs-input">Observaciones de recepción</label>
          <textarea
            id="obs-input"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Lote de fabricación, estado de empaques, etc."
          />
        </div>

        <button type="submit" className="boton-enviar">
          Cargar stock físico y ubicacion
        </button>
      </form>
    </div>
  );
}
