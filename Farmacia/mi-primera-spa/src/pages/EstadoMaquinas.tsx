import { useState } from "react";
import { maquinasPlanta, type MaquinaPlanta } from "../data/maquinas";
import "./styles.css";

interface EstadoMaquinasProps {
  onBack?: () => void;
  onNuevaMaquina?: () => void;
}

export default function EstadoMaquinas({
  onBack,
  onNuevaMaquina,
}: EstadoMaquinasProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [sectorFiltro, setSectorFiltro] = useState<string>("todos");

  const sectores = Array.from(new Set(maquinasPlanta.map((m) => m.sector)));

  const maquinasFiltradas = maquinasPlanta.filter((m) => {
    const cumpleEstado =
      filtroEstado === "todas" ||
      m.estado.toLowerCase() === filtroEstado.toLowerCase();
    const cumpleSector =
      sectorFiltro === "todos" || m.sector === sectorFiltro;
    return cumpleEstado && cumpleSector;
  });

  const getStatusClass = (estado: MaquinaPlanta["estado"]) => {
    switch (estado) {
      case "Operativa":
        return "chip-operativa";
      case "Alerta":
        return "chip-alerta";
      case "En Mantenimiento":
        return "chip-mantenimiento";
      case "Detenida":
        return "chip-detenida";
      default:
        return "";
    }
  };

  const getPuntoClass = (estado: MaquinaPlanta["estado"]) => {
    switch (estado) {
      case "Operativa":
        return "punto-verde";
      case "Alerta":
        return "punto-amarillo";
      case "En Mantenimiento":
        return "punto-azul";
      case "Detenida":
        return "punto-rojo";
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
        <h1>Estado del Parque de Máquinas</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado-con-accion">
          <div>
            <p className="subpantalla-descripcion">
              Monitoreo en vivo de telemetría de planta, semáforos de criticidad y condición de funcionamiento.
            </p>
          </div>
          {onNuevaMaquina && (
            <button
              type="button"
              className="btn-nueva-incidencia"
              onClick={onNuevaMaquina}
            >
              + Ingresar Máquina
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="maquinas-filtros-bar">
          <div className="filtro-tabs">
            <button
              type="button"
              className={`filtro-tab ${filtroEstado === "todas" ? "active" : ""}`}
              onClick={() => setFiltroEstado("todas")}
            >
              Todas ({maquinasPlanta.length})
            </button>
            <button
              type="button"
              className={`filtro-tab ${
                filtroEstado === "operativa" ? "active" : ""
              }`}
              onClick={() => setFiltroEstado("operativa")}
            >
              Operativas
            </button>
            <button
              type="button"
              className={`filtro-tab ${
                filtroEstado === "alerta" ? "active" : ""
              }`}
              onClick={() => setFiltroEstado("alerta")}
            >
              En Alerta
            </button>
            <button
              type="button"
              className={`filtro-tab ${
                filtroEstado === "en mantenimiento" ? "active" : ""
              }`}
              onClick={() => setFiltroEstado("en mantenimiento")}
            >
              En Taller
            </button>
            <button
              type="button"
              className={`filtro-tab ${
                filtroEstado === "detenida" ? "active" : ""
              }`}
              onClick={() => setFiltroEstado("detenida")}
            >
              Detenidas
            </button>
          </div>

          <div className="filtro-sector-select">
            <label htmlFor="filtroSector">Sector:</label>
            <select
              id="filtroSector"
              value={sectorFiltro}
              onChange={(e) => setSectorFiltro(e.target.value)}
            >
              <option value="todos">Todos los sectores</option>
              {sectores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="maquinas-grid-cards">
          {maquinasFiltradas.map((maq) => (
            <div key={maq.id} className="maquina-card">
              <div className="maquina-card-top">
                <div>
                  <span className="maquina-codigo">{maq.codigo}</span>
                  <span className="maquina-sector">{maq.sector}</span>
                </div>
                <div className={`resumen-chip ${getStatusClass(maq.estado)}`}>
                  <span className={`chip-punto ${getPuntoClass(maq.estado)}`} />
                  <span>{maq.estado}</span>
                </div>
              </div>

              <h3 className="maquina-nombre">{maq.nombre}</h3>

              <div className="maquina-telemetria-grid">
                <div className="telemetria-item">
                  <span className="telemetria-label">OEE</span>
                  <strong
                    className={`telemetria-valor ${
                      maq.oee >= 85
                        ? "text-green"
                        : maq.oee >= 65
                        ? "text-amber"
                        : "text-red"
                    }`}
                  >
                    {maq.oee > 0 ? `${maq.oee}%` : "0% (Parada)"}
                  </strong>
                </div>

                <div className="telemetria-item">
                  <span className="telemetria-label">Temperatura</span>
                  <strong className="telemetria-valor">{maq.temperatura}</strong>
                </div>

                <div className="telemetria-item">
                  <span className="telemetria-label">Presión</span>
                  <strong className="telemetria-valor">{maq.presion}</strong>
                </div>

                <div className="telemetria-item">
                  <span className="telemetria-label">Horas Op.</span>
                  <strong className="telemetria-valor">{maq.horasOperacion} h</strong>
                </div>
              </div>

              <div className="maquina-footer-meta">
                <span>
                  <strong>Responsable:</strong> {maq.responsable}
                </span>
                <span>
                  <strong>Próximo service:</strong> {maq.proximoMantenimiento}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

