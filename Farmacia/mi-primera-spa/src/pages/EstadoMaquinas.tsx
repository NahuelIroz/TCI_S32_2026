import { useState, useEffect } from "react";
import {
  listarMaquinasActivas,
  type MaquinaGestion,
} from "../services/maquinasService";
import "./styles.css";

interface EstadoMaquinasProps {
  onBack?: () => void;
  onNuevaMaquina?: () => void;
}

export default function EstadoMaquinas({
  onBack,
  onNuevaMaquina,
}: EstadoMaquinasProps) {
  const [maquinas, setMaquinas] = useState<MaquinaGestion[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [sectorFiltro, setSectorFiltro] = useState<string>("todos");

  useEffect(() => {
    let montado = true;

    async function cargar() {
      try {
        setCargando(true);
        setError(null);
        const data = await listarMaquinasActivas();
        if (montado) {
          setMaquinas(data);
        }
      } catch (err) {
        if (montado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo consultar el parque de máquinas"
          );
        }
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    }

    void cargar();

    return () => {
      montado = false;
    };
  }, []);

  const sectores = Array.from(new Set(maquinas.map((m) => m.sector)));

  const maquinasFiltradas = maquinas.filter((m) => {
    const cumpleEstado =
      filtroEstado === "todas" ||
      m.estado.toLowerCase() === filtroEstado.toLowerCase();
    const cumpleSector =
      sectorFiltro === "todos" || m.sector === sectorFiltro;
    return cumpleEstado && cumpleSector;
  });

  const getStatusClass = (estado: string) => {
    const norm = estado.toLowerCase();
    if (norm.includes("operativa")) return "chip-operativa";
    if (norm.includes("alerta")) return "chip-alerta";
    if (norm.includes("mantenimiento")) return "chip-mantenimiento";
    if (norm.includes("detenida")) return "chip-detenida";
    return "";
  };

  const getPuntoClass = (estado: string) => {
    const norm = estado.toLowerCase();
    if (norm.includes("operativa")) return "punto-verde";
    if (norm.includes("alerta")) return "punto-amarillo";
    if (norm.includes("mantenimiento")) return "punto-azul";
    if (norm.includes("detenida")) return "punto-rojo";
    return "";
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

        {error && (
          <div className="alerta-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <div className="maquinas-filtros-bar">
          <div className="filtro-tabs">
            <button
              type="button"
              className={`filtro-tab ${filtroEstado === "todas" ? "active" : ""}`}
              onClick={() => setFiltroEstado("todas")}
            >
              Todas ({maquinas.length})
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

        {cargando ? (
          <p className="no-items-msg">Cargando parque de maquinaria...</p>
        ) : (
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
                    <strong className="telemetria-valor">
                      {maq.horas_operacion} h
                    </strong>
                  </div>
                </div>

                <div className="maquina-footer-meta">
                  <span>
                    <strong>Responsable:</strong> {maq.responsable}
                  </span>
                  <span>
                    <strong>Próximo service:</strong>{" "}
                    {maq.proximo_mantenimiento || "Sin programar"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
