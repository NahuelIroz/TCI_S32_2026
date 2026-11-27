import { useEffect, useState } from "react";
import { obtenerMisTareas, actualizarProgresoTarea, type TareaAPI, type EstadoTarea } from "../services/tareasService";
import "./styles.css";

interface MisTareasProps { onBack?: () => void; }
const filtros = ["Todas", "Pendiente", "En Curso", "Demorada", "Completada"] as const;

export default function MisTareas({ onBack }: MisTareasProps) {
  const [tareas, setTareas] = useState<TareaAPI[]>([]);
  const [filtro, setFiltro] = useState<EstadoTarea | "Todas">("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [observaciones, setObservaciones] = useState("");

  async function cargar() {
    setCargando(true); setError("");
    try { setTareas(await obtenerMisTareas()); setEditando(null); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudieron cargar las tareas"); }
    finally { setCargando(false); }
  }
  useEffect(() => { void cargar(); }, []);

  function editar(t: TareaAPI) {
    setEditando(t.id); setProgreso(t.progreso); setObservaciones(t.observaciones ?? ""); setError(""); setMensaje("");
  }
  async function guardar(t: TareaAPI) {
    if (guardando || progreso < t.progreso || progreso > 100) return;
    if (progreso === 100 && !window.confirm("¿Confirmás que la tarea está completada?")) return;
    setGuardando(true); setError(""); setMensaje("");
    try {
      const actualizada = await actualizarProgresoTarea(t.id, progreso, observaciones);
      setTareas(prev => prev.map(x => x.id === t.id ? actualizada : x));
      setEditando(null); setMensaje("Tarea actualizada correctamente.");
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar el avance"); }
    finally { setGuardando(false); }
  }
  const visibles = tareas.filter(t => (filtro === "Todas" || t.estado === filtro) && `${t.codigo} ${t.titulo} ${t.maquina} ${t.codigo_maquina}`.toLowerCase().includes(busqueda.trim().toLowerCase()));
  return (
    <div className="incidencia-container">
      <header className="incidencia-header">
        <button type="button" className="boton-volver" onClick={onBack} aria-label="Volver">←</button>
        <h1>Mis tareas asignadas</h1>
      </header>
      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado-con-accion">
          <p className="subpantalla-descripcion">Consultá tus órdenes de mantenimiento y registrá el avance de cada trabajo.</p>
          <button type="button" className="btn-progreso" disabled={cargando || guardando} onClick={() => void cargar()}>Actualizar listado</button>
        </div>
        {cargando && <p role="status">Cargando tareas...</p>}
        {error && <p role="alert">{error}</p>}
        {mensaje && <div className="feedback-banner feedback-banner-success" role="status">{mensaje}</div>}
        <div className="kpi-grid">
          {([ ["Pendiente", "Pendientes", "text-amber"], ["En Curso", "En curso", "text-blue"], ["Completada", "Completadas", "text-green"] ] as const).map(([estado, label, color]) => (
            <div className="kpi-card" key={estado}><span className="kpi-label">{label}</span><strong className={`kpi-value ${color}`}>{tareas.filter(t => t.estado === estado).length}</strong></div>
          ))}
        </div>
        <div className="form-group"><label htmlFor="buscarTarea">Buscar tarea</label><input id="buscarTarea" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Código, título o máquina" /></div>
        <div className="filtro-tabs">
          {filtros.map(f => <button type="button" key={f} className={`filtro-tab ${filtro === f ? "active" : ""}`} onClick={() => setFiltro(f)}>{f} ({f === "Todas" ? tareas.length : tareas.filter(t => t.estado === f).length})</button>)}
        </div>
        {!cargando && !error && visibles.length === 0 && <p>No hay tareas para mostrar.</p>}
        <div className="tareas-lista">
          {visibles.map(t => (
            <article className="tarea-card" key={t.id}>
              <div className="tarea-card-top">
                <div><span className="tarea-codigo">{t.codigo}</span><span className="tarea-tipo-chip">{t.tipo}</span><span className="tarea-maquina-chip">{t.maquina}</span></div>
                <div className="tarea-badges-right">
                  <span className={`badge-prioridad ${t.prioridad === "Alta" ? "badge-urgente" : t.prioridad === "Media" ? "badge-media" : "badge-baja"}`}>{t.prioridad}</span>
                  <span className={`badge-estado-tarea ${t.estado === "Completada" ? "badge-completada" : t.estado === "En Curso" ? "badge-en-curso" : "badge-pendiente-tarea"}`}>{t.estado}</span>
                </div>
              </div>
              <h3 className="tarea-titulo">{t.titulo}</h3><p className="tarea-desc">{t.descripcion}</p>
              <div className="tarea-meta-row"><span><strong>Equipo:</strong> {t.codigo_maquina}</span><span><strong>Límite:</strong> {t.fecha_limite || "Sin fecha"}</span>{t.observaciones && <span className="tarea-nota">Observaciones: {t.observaciones}</span>}</div>
              <div className="tarea-progreso-container"><div className="tarea-progreso-header"><span className="progreso-label">Avance registrado</span><span className="progreso-porcentaje">{t.progreso}%</span></div><div className="barra-progreso-track"><div className={`barra-progreso-fill ${t.progreso === 100 ? "fill-completo" : t.progreso >= 50 ? "fill-medio" : "fill-inicial"}`} style={{width: `${t.progreso}%`}} /></div></div>
              {t.estado !== "Completada" && (editando === t.id ? (
                <form onSubmit={e => { e.preventDefault(); void guardar(t); }}>
                  <div className="form-group"><label htmlFor={`avance-${t.id}`}>Nuevo avance: {progreso}%</label><input id={`avance-${t.id}`} type="range" min={t.progreso} max={100} step={1} value={progreso} disabled={guardando} onChange={e => setProgreso(Number(e.target.value))} /></div>
                  <div className="form-group"><label htmlFor={`nota-${t.id}`}>Observaciones</label><textarea id={`nota-${t.id}`} rows={3} value={observaciones} disabled={guardando} onChange={e => setObservaciones(e.target.value)} /></div>
                  <div className="tarea-acciones-supervisor"><button type="submit" className="btn-aprobar-completado" disabled={guardando}>{guardando ? "Guardando..." : progreso === 100 ? "Completar tarea" : "Guardar avance"}</button><button type="button" className="btn-progreso" disabled={guardando} onClick={() => setEditando(null)}>Cancelar</button></div>
                </form>
              ) : <div className="tarea-acciones-supervisor"><button type="button" className="btn-progreso" disabled={guardando || cargando} onClick={() => editar(t)}>Registrar avance</button></div>)}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}