import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { obtenerTareas, obtenerTecnicos, crearTarea, actualizarProgresoTarea, type TareaAPI, type TecnicoAPI, type PrioridadTarea, type TipoTarea } from "../services/tareasService";
import { obtenerMaquinas, type MaquinaAPI } from "../services/maquinasService";
import "./styles.css";

interface SupervisarTareasProps { onBack?: () => void; }
export default function SupervisarTareas({ onBack }: SupervisarTareasProps) {
  const [tareas, setTareas] = useState<TareaAPI[]>([]);
  const [maquinas, setMaquinas] = useState<MaquinaAPI[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoAPI[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [mostrarModalDelegar, setMostrarModalDelegar] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevaMaquina, setNuevaMaquina] = useState("");
  const [nuevoTecnico, setNuevoTecnico] = useState("");
  const [nuevaPrioridad, setNuevaPrioridad] = useState<PrioridadTarea>("Alta");
  const [nuevoTipo, setNuevoTipo] = useState<TipoTarea>("Preventivo");
  const [nuevaFechaLimite, setNuevaFechaLimite] = useState("");

  async function cargar() {
    setCargando(true); setError("");
    try {
      const [t, m, u] = await Promise.all([obtenerTareas(), obtenerMaquinas(), obtenerTecnicos()]);
      setTareas(t); setMaquinas(m); setTecnicos(u);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudieron cargar los datos"); }
    finally { setCargando(false); }
  }
  useEffect(() => { void cargar(); }, []);

  async function handleCrearTarea(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (guardando || !nuevoTitulo.trim() || !nuevaMaquina) return;
    setGuardando(true); setError(""); setMensajeFeedback("");
    try {
      const nueva = await crearTarea({
        codigo: `TAR-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        titulo: nuevoTitulo.trim(), descripcion: nuevaDescripcion.trim(),
        maquina_id: Number(nuevaMaquina), tecnico_asignado_id: nuevoTecnico ? Number(nuevoTecnico) : null,
        prioridad: nuevaPrioridad, tipo: nuevoTipo, estado: "Pendiente", progreso: 0,
        fecha_limite: nuevaFechaLimite.split("-").reverse().join("/"), observaciones: null,
      });
      setTareas(prev => [nueva, ...prev]); setMostrarModalDelegar(false);
      setNuevoTitulo(""); setNuevaDescripcion(""); setNuevaMaquina(""); setNuevoTecnico(""); setNuevaFechaLimite(""); setFiltroEstado("todas");
      setMensajeFeedback(`Tarea ${nueva.codigo} guardada correctamente.`);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo crear la tarea"); }
    finally { setGuardando(false); }
  }
  async function guardarProgreso(id: number, progreso: number) {
    if (guardando) return;
    setGuardando(true); setError(""); setMensajeFeedback("");
    try {
      const actualizada = await actualizarProgresoTarea(id, progreso);
      setTareas(prev => prev.map(t => t.id === id ? actualizada : t));
      setMensajeFeedback("Progreso actualizado correctamente.");
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo actualizar la tarea"); }
    finally { setGuardando(false); }
  }
  function handleActualizarProgreso(id: number, delta: number) {
    const t = tareas.find(t => t.id === id);
    if (t) void guardarProgreso(id, Math.max(0, Math.min(100, t.progreso + delta)));
  }
  function handleMarcarCompletada(id: number) { void guardarProgreso(id, 100); }
  const tareasFiltradas = tareas.filter(t => filtroEstado === "todas" || t.estado.toLowerCase() === filtroEstado);
  const enCursoCount = tareas.filter(t => t.estado === "En Curso").length;
  const pendientesCount = tareas.filter(t => t.estado === "Pendiente").length;
  const completadasCount = tareas.filter(t => t.estado === "Completada").length;
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
            <p className="subpantalla-descripcion">
              Delegá órdenes técnicas, asigná especialistas y supervisá el cumplimiento de preventivos y correctivos.
            </p>
          </div>
          <button
            type="button"
            className="btn-nueva-incidencia"
            disabled={cargando || guardando}
            onClick={() => setMostrarModalDelegar(!mostrarModalDelegar)}
          >
            {mostrarModalDelegar ? "✕ Cancelar" : "+ Delegar Nueva Tarea"}
          </button>
        </div>

        <button type="button" className="btn-progreso" disabled={cargando || guardando} onClick={() => void cargar()}>Actualizar listado</button>
        {cargando && <p role="status">Cargando tareas...</p>}
        {error && <p role="alert">{error}</p>}
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
                  id="maquinaTarea" required
                  value={nuevaMaquina}
                  onChange={(e) => setNuevaMaquina(e.target.value)}
                >
                  <option value="">Seleccioná una máquina</option>
                  {maquinas.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.codigo})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tecnicoTarea">Técnico Asignado</label>
                <select
                  id="tecnicoTarea"
                  value={nuevoTecnico}
                  onChange={(e) => setNuevoTecnico(e.target.value)}
                >
                  <option value="">Sin asignar</option>
                  {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre} ({t.username})</option>)}
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
                  type="date" required
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

            <button type="submit" className="boton-enviar" disabled={guardando || cargando}>
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
            <span className="kpi-desc">Avance del 100%</span>
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

        <button type="button" className={`filtro-tab ${filtroEstado === "demorada" ? "active" : ""}`} onClick={() => setFiltroEstado("demorada")}>Demoradas ({tareas.filter(t => t.estado === "Demorada").length})</button>
        {!cargando && !error && tareasFiltradas.length === 0 && <p>No hay tareas para este filtro.</p>}
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
                  <strong>Técnico:</strong> {tarea.tecnico_asignado}
                </span>
                <span>
                  <strong>Límite:</strong> {tarea.fecha_limite}
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
                  disabled={guardando || tarea.progreso >= 100}
                >
                  +25% Avance
                </button>
                <button
                  type="button"
                  className="btn-progreso"
                  onClick={() => handleActualizarProgreso(tarea.id, -25)}
                  disabled={guardando || tarea.progreso <= 0}
                >
                  -25%
                </button>
                {tarea.progreso < 100 && (
                  <button
                    type="button"
                    className="btn-aprobar-completado" disabled={guardando}
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

