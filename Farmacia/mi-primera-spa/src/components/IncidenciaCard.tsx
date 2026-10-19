
import type { Incidencia } from "../data/incidencias";
import "./IncidenciaCard.css";

interface IncidenciaCardProps {
  incidencia: Incidencia;
  onDetalle?: (incidencia: Incidencia) => void;
}

function IncidenciaCard({
  incidencia,
  onDetalle,
}: IncidenciaCardProps) {
  return (
    <article className="inc-card">
      <div className="inc-card-superior">
        <span className="inc-codigo">
          #{incidencia.codigo}
        </span>

        <span className="inc-fecha">
          ◷ {incidencia.fecha}
        </span>

        <span
          className={`inc-estado estado-${incidencia.estado
            .toLowerCase()
            .replace(" ", "-")}`}
        >
          {incidencia.estado}
        </span>
      </div>

      <div className="inc-card-titulo">
        <h3>{incidencia.maquina}</h3>
        <small>{incidencia.codigoMaquina}</small>
      </div>

      <p className="inc-descripcion">
        {incidencia.descripcion}
      </p>

      <div className="inc-card-footer">
        <span>📎 {incidencia.adjuntos} adjuntos</span>
        <span>◷ Turno {incidencia.turno}</span>

        <button
          type="button"
          onClick={() => onDetalle?.(incidencia)}
        >
          Detalles ›
        </button>
      </div>
    </article>
  );
}

export default IncidenciaCard;
