import { useState } from "react";
import { repuestos } from "../data/repuestos";
import {
  trazabilidadInicial,
  type HitoTrazabilidad,
} from "../data/trazabilidadData";
import "./styles.css";

interface TrazabilidadRepuestoProps {
  onBack?: () => void;
  repuestoCodigoInicial?: string;
}

export default function TrazabilidadRepuesto({
  onBack,
  repuestoCodigoInicial,
}: TrazabilidadRepuestoProps) {
  const [repuestoSeleccionado, setRepuestoSeleccionado] = useState<string>(
    repuestoCodigoInicial ?? repuestos[0]?.codigo ?? "SKU-6204-2R"
  );

  const repuestoInfo = repuestos.find((r) => r.codigo === repuestoSeleccionado);
  const historialRepuesto = trazabilidadInicial.filter(
    (h) => h.repuestoCodigo === repuestoSeleccionado
  );

  const getHitoBadgeClass = (tipo: HitoTrazabilidad["tipo"]) => {
    switch (tipo) {
      case "compra":
        return "badge-cotizacion";
      case "recepcion":
        return "badge-aprobado";
      case "reserva":
        return "badge-pendiente";
      case "uso":
        return "badge-urgente";
      default:
        return "";
    }
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
        <h1>Trazabilidad de Repuestos</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado">
          <span className="badge-seccion verde">Regla RN-06 · Historia Interna</span>
          <p className="subpantalla-descripcion">
            Reconstrucción completa del ciclo de vida interno: Solicitud de compra → Recepción en almacén → Uso en reparaciones.
          </p>
        </div>

        <div className="form-group mb-md">
          <label htmlFor="selectorRepuesto">Seleccionar pieza para auditar historia:</label>
          <select
            id="selectorRepuesto"
            value={repuestoSeleccionado}
            onChange={(e) => setRepuestoSeleccionado(e.target.value)}
          >
            {repuestos.map((r) => (
              <option key={r.codigo} value={r.codigo}>
                {r.codigo} — {r.nombre} (Stock actual: {r.disponible} {r.unidad})
              </option>
            ))}
          </select>
        </div>

        {repuestoInfo && (
          <div className="tablero-bloque">
            <div className="tablero-bloque-header">
              <div>
                <span className="pedido-sku">{repuestoInfo.codigo}</span>
                <h3 className="maquina-nombre mt-xs">{repuestoInfo.nombre}</h3>
              </div>
              <span
                className={`badge-estado-pedido ${
                  repuestoInfo.disponible > repuestoInfo.minimo
                    ? "badge-aprobado"
                    : "badge-pendiente"
                }`}
              >
                Stock: {repuestoInfo.disponible} {repuestoInfo.unidad}
              </span>
            </div>
            <div className="pedido-detalles-grid">
              <div>
                <span className="detalle-rotulo">Ubicación física:</span>
                <span className="detalle-valor">{repuestoInfo.ubicacion}</span>
              </div>
              <div>
                <span className="detalle-rotulo">Umbral mínimo (RN-02):</span>
                <span className="detalle-valor">{repuestoInfo.minimo} {repuestoInfo.unidad}</span>
              </div>
              <div>
                <span className="detalle-rotulo">Eventos registrados:</span>
                <span className="detalle-valor text-blue">
                  {historialRepuesto.length} movimientos
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Línea de Tiempo de Trazabilidad */}
        <h3 className="seccion-subtitulo">
          Línea de tiempo interna (RN-06)
        </h3>

        {historialRepuesto.length === 0 ? (
          <p className="no-items-msg">
            No se han registrado movimientos de compra o uso para este repuesto aún.
          </p>
        ) : (
          <div className="trazabilidad-timeline">
            {historialRepuesto.map((hito, idx) => (
              <div key={hito.id} className="timeline-item">
                <div className="timeline-marker">
                  <span className="timeline-numero">{idx + 1}</span>
                </div>
                <div className="timeline-contenido">
                  <div className="timeline-header">
                    <div>
                      <span className={`badge-estado-pedido ${getHitoBadgeClass(hito.tipo)}`}>
                        {hito.titulo}
                      </span>
                      <strong className="timeline-ref ml-xs">{hito.referencia}</strong>
                    </div>
                    <span className="timeline-fecha">{hito.fecha}</span>
                  </div>

                  <p className="timeline-detalles">{hito.detalles}</p>

                  <div className="timeline-meta">
                    <span>
                      <strong>Cantidad:</strong> {hito.cantidad} {hito.unidad}
                    </span>
                    <span>
                      <strong>Responsable:</strong> {hito.usuario}
                    </span>
                    {hito.ubicacion && (
                      <span>
                        <strong>Ubicación:</strong> {hito.ubicacion}
                      </span>
                    )}
                    {hito.maquina && (
                      <span>
                        <strong>Máquina:</strong> {hito.maquina}
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
