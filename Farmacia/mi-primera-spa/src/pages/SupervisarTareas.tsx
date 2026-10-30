import { useState } from "react";
import {
  tareasIniciales,
  type TareaMantenimiento,
  type EstadoTarea,
  type PrioridadTarea,
  type TipoTarea,
} from "../data/tareas";
import "./styles.css";

interface SupervisarTareasProps {
  onBack?: () => void;
}

export default function SupervisarTareas({ onBack }: SupervisarTareasProps) {
  const [tareas, setTareas] = useState<TareaMantenimiento[]>(tareasIniciales);
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [mostrarModalDelegar, setMostrarModalDelegar] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState<string>("");

  // Formulario nueva tarea
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevaMaquina, setNuevaMaquina] = useState("Envasadora Rotativa #03");
  const [nuevoTecnico, setNuevoTecnico] = useState("Carlos Gómez");
  const [nuevaPrioridad, setNuevaPrioridad] = useState<PrioridadTarea>("Alta");
  const [nuevoTipo, setNuevoTipo] = useState<TipoTarea>("Preventivo");
  const [nuevaFechaLimite, setNuevaFechaLimite] = useState("05/11/2026");

  const handleCrearTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) {
      alert("Por favor ingresá el título de la tarea.");
      return;
    }

    const nueva: TareaMantenimiento = {
      id: Date.now(),
      codigo: `TAR-2026-0${tareas.length + 85}`,
      titulo: nuevoTitulo,
      descripcion: nuevaDescripcion,
      maquina: nuevaMaquina,
      codigoMaquina: nuevaMaquina.includes("Envasadora")
        ? "SEC-ENV-03"
        : nuevaMaquina.includes("Prensa")
        ? "HYD-PRE-12"
        : "CMP-CTR-01",
      tecnicoAsignado: nuevoTecnico,
      prioridad: nuevaPrioridad,
      tipo: nuevoTipo,
      estado: "Pendiente",
      fechaLimite: nuevaFechaLimite,
      progreso: 0,
      observaciones: "Asignada por Encargado de Mantenimiento.",
    };

    setTareas([nueva, ...tareas]);
    setMostrarModalDelegar(false);
    setNuevoTitulo("");
    setNuevaDescripcion("");
    setMensajeFeedback(`Tarea "${nueva.codigo}" asignada con éxito a ${nueva.tecnicoAsignado}.`);
  };

  const handleActualizarProgreso = (id: number, delta: number) => {
    setTareas((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nuevoProgreso = Math.min(100, Math.max(0, t.progreso + delta));
        const nuevoEstado: EstadoTarea =
          nuevoProgreso === 100
            ? "Completada"
            : nuevoProgreso > 0
            ? "En Curso"
            : "Pendiente";
        return {
          ...t,
          progreso: nuevoProgreso,
          estado: nuevoEstado,
        };
      })
    );
  };

  const handleMarcarCompletada = (id: number) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, progreso: 100, estado: "Completada" } : t
      )
    );
    setMensajeFeedback("Tarea marcada como completada al 100%.");
  };

  const tareasFiltradas = tareas.filter((t) => {
    if (filtroEstado === "todas") return true;
    return t.estado.toLowerCase() === filtroEstado.toLowerCase();
  });

  const enCursoCount = tareas.filter((t) => t.estado === "En Curso").length;
  const pendientesCount = tareas.filter((t) => t.estado === "Pendiente").length;
  const completadasCount = tareas.filter((t) => t.estado === "Completada").length;

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
        <h1>Delegación y Supervisión de Tareas</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado-con-accion">
          <div>
            <span className="badge-seccion verde">Administrar · Supervisión</span>
            <p className="subpantalla-descripcion">
              Delegá órdenes técnicas, asigná especialistas y supervisá el cumplimiento de preventivos y correctivos.
            </p>
          </div>
          <button
            type="button"
            className="btn-nueva-incidencia"
            onClick={() => setMostrarModalDelegar(!mostrarModalDelegar)}
          >
            {mostrarModalDelegar ? "✕ Cancelar" : "+ Delegar Nueva Tarea"}
          </button>
        </div>

        {mensajeFeedback && (
          <div className="feedback-banner feedback-banner-success" role="status">
            <span>✓</span> {mensajeFeedback}
          </div>
        )}

        {mostrarModalDelegar && (
          <form className="formulario-delegar-tarea" onSubmit={handleCrearTarea}>
            <h3>Delegar Orden de Mantenimiento</h3>

            <div className="form-group">
              <label htmlFor="tituloTarea">Título de la tarea</label>
              <input
                id="tituloTarea"
                type="text"
                placeholder="Ej. Lubricación de cadenas y rodillos de tracción"
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="maquinaTarea">Equipo / Máquina</label>
                <select
                  id="maquinaTarea"
                  value={nuevaMaquina}
                  onChange={(e) => setNuevaMaquina(e.target.value)}
                >
                  <option value="Envasadora Rotativa #03">Envasadora Rotativa #03</option>
                  <option value="Prensa Hidráulica H-12">Prensa Hidráulica H-12</option>
                  <option value="Compresor Central C-01">Compresor Central C-01</option>
                  <option value="Blistera Automática #04">Blistera Automática #04</option>
                  <option value="Lavadora de Ampollas L-02">Lavadora de Ampollas L-02</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tecnicoTarea">Técnico Asignado</label>
                <select
                  id="tecnicoTarea"
                  value={nuevoTecnico}
                  onChange={(e) => setNuevoTecnico(e.target.value)}
                >
                  <option value="Carlos Gómez">Carlos Gómez (Mecánica)</option>
                  <option value="J. Morales">J. Morales (Hidráulica / Neumática)</option>
                  <option value="M. López">M. López (Electricidad / Automatización)</option>
                  <option value="Sin asignar">Sin asignar (Bolsa de trabajo)</option>
                </select>
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="prioridadTarea">Prioridad</label>
                <select
                  id="prioridadTarea"
                  value={nuevaPrioridad}
                  onChange={(e) => setNuevaPrioridad(e.target.value as PrioridadTarea)}
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tipoTarea">Tipo</label>
                <select
                  id="tipoTarea"
                  value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(e.target.value as TipoTarea)}
                >
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                  <option value="Predictivo">Predictivo</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fechaLimiteTarea">Fecha Límite</label>
                <input
                  id="fechaLimiteTarea"
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={nuevaFechaLimite}
                  onChange={(e) => setNuevaFechaLimite(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="descTarea">Instrucciones y especificaciones técnicas</label>
              <textarea
                id="descTarea"
                rows={3}
                placeholder="Detalle el protocolo de intervención y precauciones de seguridad..."
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
              />
            </div>

            <button type="submit" className="boton-enviar">
              Confirmar Delegación de Tarea
            </button>
          </form>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Tareas en Curso</span>
            <strong className="kpi-value text-blue">{enCursoCount}</strong>
            <span className="kpi-desc">Técnicos interviniendo</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Pendientes</span>
            <strong className="kpi-value text-amber">{pendientesCount}</strong>
            <span className="kpi-desc">Por iniciar</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Completadas</span>
            <strong className="kpi-value text-green">{completadasCount}</strong>
            <span className="kpi-desc">Auditadas y cerradas</span>
          </div>
        </div>

        <div className="filtro-tabs">
          <button
            type="button"
            className={`filtro-tab ${filtroEstado === "todas" ? "active" : ""}`}
            onClick={() => setFiltroEstado("todas")}
          >
            Todas ({tareas.length})
          </button>
          <button
            type="button"
            className={`filtro-tab ${filtroEstado === "en curso" ? "active" : ""}`}
            onClick={() => setFiltroEstado("en curso")}
          >
            En Curso ({enCursoCount})
          </button>
          <button
            type="button"
            className={`filtro-tab ${filtroEstado === "pendiente" ? "active" : ""}`}
            onClick={() => setFiltroEstado("pendiente")}
          >
            Pendientes ({pendientesCount})
          </button>
          <button
            type="button"
            className={`filtro-tab ${filtroEstado === "completada" ? "active" : ""}`}
            onClick={() => setFiltroEstado("completada")}
          >
            Completadas ({completadasCount})
          </button>
        </div>

        <div className="tareas-lista">
          {tareasFiltradas.map((tarea) => (
            <div key={tarea.id} className="tarea-card">
              <div className="tarea-card-top">
                <div>
                  <span className="tarea-codigo">{tarea.codigo}</span>
                  <span className="tarea-tipo-chip">{tarea.tipo}</span>
                  <span className="tarea-maquina-chip">{tarea.maquina}</span>
                </div>
                <div className="tarea-badges-right">
                  <span
                    className={`badge-prioridad ${
                      tarea.prioridad === "Alta"
                        ? "badge-urgente"
                        : tarea.prioridad === "Media"
                        ? "badge-media"
                        : "badge-baja"
                    }`}
                  >
                    {tarea.prioridad}
                  </span>
                  <span
                    className={`badge-estado-tarea ${
                      tarea.estado === "Completada"
                        ? "badge-completada"
                        : tarea.estado === "En Curso"
                        ? "badge-en-curso"
                        : "badge-pendiente-tarea"
                    }`}
                  >
                    {tarea.estado}
                  </span>
                </div>
              </div>

              <h3 className="tarea-titulo">{tarea.titulo}</h3>
              <p className="tarea-desc">{tarea.descripcion}</p>

              <div className="tarea-meta-row">
                <span>
                  <strong>Técnico:</strong> {tarea.tecnicoAsignado}
                </span>
                <span>
                  <strong>Límite:</strong> {tarea.fechaLimite}
                </span>
                {tarea.observaciones && (
                  <span className="tarea-nota">
                    <em>Nota:</em> {tarea.observaciones}
                  </span>
                )}
              </div>

              <div className="tarea-progreso-container">
                <div className="tarea-progreso-header">
                  <span className="progreso-label">Cumplimiento de la tarea:</span>
                  <span className="progreso-porcentaje">{tarea.progreso}%</span>
                </div>
                <div className="barra-progreso-track">
                  <div
                    className={`barra-progreso-fill ${
                      tarea.progreso === 100
                        ? "fill-completo"
                        : tarea.progreso >= 50
                        ? "fill-medio"
                        : "fill-inicial"
                    }`}
                    style={{ width: `${tarea.progreso}%` }}
                  />
                </div>
              </div>

              <div className="tarea-acciones-supervisor">
                <span className="supervisor-label">Supervisión:</span>
                <button
                  type="button"
                  className="btn-progreso"
                  onClick={() => handleActualizarProgreso(tarea.id, 25)}
                  disabled={tarea.progreso >= 100}
                >
                  +25% Avance
                </button>
                <button
                  type="button"
                  className="btn-progreso"
                  onClick={() => handleActualizarProgreso(tarea.id, -25)}
                  disabled={tarea.progreso <= 0}
                >
                  -25%
                </button>
                {tarea.progreso < 100 && (
                  <button
                    type="button"
                    className="btn-aprobar-completado"
                    onClick={() => handleMarcarCompletada(tarea.id)}
                  >
                    ✓ Aprobar Cumplimiento
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

