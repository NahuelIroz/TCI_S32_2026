
import type { Repuesto } from "../data/repuestos";
import "./RepuestoCard.css";

interface RepuestoCardProps {
  repuesto: Repuesto;
  onComprar?: (repuesto: Repuesto) => void;
  onVerTrazabilidad?: (repuesto: Repuesto) => void;
}

function RepuestoCard({
  repuesto,
  onComprar,
  onVerTrazabilidad,
}: RepuestoCardProps) {
  const claseEstado =
    repuesto.estado === "Disponible"
      ? "disponible"
      : repuesto.estado === "Stock Bajo"
      ? "bajo"
      : "agotado";

  return (
    <article className="repuesto-card">

      <div className="repuesto-card-header">
        <span className="repuesto-codigo">
          #{repuesto.codigo}
        </span>

        <span className={`repuesto-estado ${claseEstado}`}>
          ● {repuesto.estado}
        </span>
      </div>

      <h3 className="repuesto-nombre">
        {repuesto.nombre}
      </h3>

      {repuesto.ubicacion && (
        <div className="repuesto-ubicacion">
          <span className="repuesto-ubicacion-icon">📍</span>
          <span>{repuesto.ubicacion}</span>
        </div>
      )}

      <div className="repuesto-card-footer">

        <div className="repuesto-cantidades">
          <div>
            <small>Disponible</small>
            <p className={claseEstado}>
              <strong>{repuesto.disponible}</strong>
              {" "}{repuesto.unidad}
            </p>
          </div>

          <div>
            <small>Mínimo</small>
            <p>
              <strong>{repuesto.minimo}</strong>
              {" "}{repuesto.unidad}
            </p>
          </div>
        </div>

        <div className="repuesto-acciones-botones">
          {onVerTrazabilidad && (
            <button
              type="button"
              className="btn-trazabilidad-mini"
              onClick={() => onVerTrazabilidad(repuesto)}
              title="Ver historia interna (RN-06)"
            >
              📜 Historia
            </button>
          )}

          <button
            type="button"
            className="repuesto-comprar"
            onClick={() => onComprar?.(repuesto)}
          >
            🛒 Comprar
          </button>
        </div>

      </div>
    </article>
  );
}

export default RepuestoCard;
