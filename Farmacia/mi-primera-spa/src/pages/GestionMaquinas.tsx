import { useCallback, useEffect, useState } from "react";
import {
  listarMaquinasGestion,
  crearMaquina,
  editarMaquina,
  cambiarActivoMaquina,
  type MaquinaGestion,
  type MaquinaGestionCreate,
} from "../services/maquinasService";
import "./styles.css";

interface Props { onBack: () => void; }
type Filtro = "activas" | "inactivas" | "todas";
const inicial: MaquinaGestionCreate = {
  codigo: "", nombre: "", tipo: "", sector: "", estado: "Operativa",
  criticidad: "Media", oee: 0, temperatura: "N/D", presion: "N/D",
  horas_operacion: 0, ultima_revision: "", proximo_mantenimiento: "",
  responsable: "Sin asignar",
};

export default function GestionMaquinas({ onBack }: Props) {
  const [maquinas, setMaquinas] = useState<MaquinaGestion[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("activas");
  const [editando, setEditando] = useState<MaquinaGestion | null>(null);
  const [formulario, setFormulario] = useState<MaquinaGestionCreate>({ ...inicial });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try { setMaquinas(await listarMaquinasGestion()); }
    catch (err) { setError(err instanceof Error ? err.message : "No se pudieron cargar las máquinas."); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  const visibles = maquinas.filter((m) => {
    const texto = busqueda.trim().toLowerCase();
    return (filtro === "todas" || (filtro === "activas" ? m.activo : !m.activo)) &&
      [m.codigo, m.nombre, m.tipo, m.sector].some((v) => v.toLowerCase().includes(texto));
  });
  function cambiarCampo<K extends keyof MaquinaGestionCreate>(campo: K, valor: MaquinaGestionCreate[K]) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
  }
  function nueva() {
    setEditando(null); setFormulario({ ...inicial }); setError(""); setMensaje(""); setMostrarFormulario(true);
  }
  function editar(m: MaquinaGestion) {
    setEditando(m);
    setFormulario({
      codigo: m.codigo, nombre: m.nombre, tipo: m.tipo, sector: m.sector,
      estado: m.estado, criticidad: m.criticidad, oee: m.oee,
      temperatura: m.temperatura, presion: m.presion,
      horas_operacion: m.horas_operacion, ultima_revision: m.ultima_revision,
      proximo_mantenimiento: m.proximo_mantenimiento, responsable: m.responsable,
    });
    setError(""); setMensaje(""); setMostrarFormulario(true);
  }
  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setGuardando(true); setError(""); setMensaje("");
    try {
      if (editando) {
        await editarMaquina(editando.id, formulario);
        setMensaje("Máquina actualizada correctamente.");
      } else {
        await crearMaquina(formulario);
        setMensaje("Máquina creada correctamente.");
      }
      setMostrarFormulario(false); setEditando(null); await cargar();
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo guardar la máquina."); }
    finally { setGuardando(false); }
  }
  async function cambiarEstado(m: MaquinaGestion) {
    if (!window.confirm(`¿Querés ${m.activo ? "desactivar" : "reactivar"} la máquina ${m.codigo}?`)) return;
    setError(""); setMensaje("");
    try {
      await cambiarActivoMaquina(m.id, !m.activo);
      setMensaje(`Máquina ${m.activo ? "desactivada" : "reactivada"} correctamente.`);
      await cargar();
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo cambiar el estado."); }
  }
  return (
    <div className="incidencia-container mis-incidencias">
      <header className="incidencia-header">
        <button type="button" className="boton-volver" onClick={onBack} aria-label="Volver">←</button>
        <h1>Gestión de máquinas</h1>
      </header>
      <main className="incidencia-form mis-contenido">
        {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
        {mensaje && <p role="status" style={{ color: "#047857" }}>{mensaje}</p>}
        {!mostrarFormulario ? <>
          <div className="campo mis-buscador">
            <label htmlFor="buscar-maquina">Buscar máquina</label>
            <input id="buscar-maquina" type="search" placeholder="Código, nombre, tipo o sector..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <div className="mis-filtros">
            {(["activas", "inactivas", "todas"] as Filtro[]).map((opcion) => (
              <button key={opcion} type="button" className={filtro === opcion ? "filtro activo" : "filtro"} onClick={() => setFiltro(opcion)}>
                {opcion === "activas" ? "Activas" : opcion === "inactivas" ? "Inactivas" : "Todas"}
              </button>
            ))}
          </div>
          <button type="button" className="details-button" onClick={nueva}>+ Nueva máquina</button>
          <button type="button" className="details-button" disabled={cargando} onClick={() => void cargar()}>Actualizar listado</button>
          <div className="mis-sincronizacion">{cargando ? "Cargando..." : `${visibles.length} máquinas encontradas`}</div>
          <section className="mis-listado">
            {!cargando && visibles.length === 0 && <p className="mis-vacio">No se encontraron máquinas.</p>}
            {visibles.map((m) => <article key={m.id} style={{ background: "#fff", border: "1px solid #dbe3ed", borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div><strong>{m.nombre}</strong><div style={{ fontSize: 12, color: "#64748b" }}>{m.codigo}</div></div>
                <span style={{ color: m.activo ? "#047857" : "#b91c1c", fontSize: 12, fontWeight: 700 }}>{m.activo ? "Activa" : "Inactiva"}</span>
              </div>
              <p>Tipo: {m.tipo} · Sector: {m.sector}</p>
              <p>Estado operativo: <strong>{m.estado}</strong></p>
              <p>Criticidad: {m.criticidad} · OEE: {m.oee}%</p>
              <p>Responsable: {m.responsable}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" className="details-button" onClick={() => editar(m)}>Editar</button>
                <button type="button" className="details-button" onClick={() => void cambiarEstado(m)}>{m.activo ? "Desactivar" : "Reactivar"}</button>
              </div>
            </article>)}
          </section>
        </> : <form onSubmit={(e) => void guardar(e)}>
          <h2>{editando ? "Editar máquina" : "Nueva máquina"}</h2>
          {([ ["codigo", "Código"], ["nombre", "Nombre"], ["tipo", "Tipo"], ["sector", "Sector"], ["responsable", "Responsable"], ["temperatura", "Temperatura"], ["presion", "Presión"], ["ultima_revision", "Última revisión"], ["proximo_mantenimiento", "Próximo mantenimiento"] ] as const).map(([campo, etiqueta]) => (
            <div className="campo" key={campo}>
              <label htmlFor={`maq-${campo}`}>{etiqueta}</label>
              <input id={`maq-${campo}`} value={formulario[campo]} required={["codigo", "nombre", "tipo", "sector"].includes(campo)} onChange={(e) => cambiarCampo(campo, e.target.value)} />
            </div>
          ))}
          <div className="campo"><label htmlFor="maq-estado">Estado operativo</label>
            <select id="maq-estado" value={formulario.estado} onChange={(e) => cambiarCampo("estado", e.target.value)}>
              {["Operativa", "Alerta", "En Mantenimiento", "Detenida"].map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="campo"><label htmlFor="maq-criticidad">Criticidad</label>
            <select id="maq-criticidad" value={formulario.criticidad} onChange={(e) => cambiarCampo("criticidad", e.target.value)}>
              {["Baja", "Media", "Alta", "Crítica"].map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          {([ ["oee", "OEE (%)", 100], ["horas_operacion", "Horas de operación", undefined] ] as const).map(([campo, etiqueta, maximo]) => (
            <div className="campo" key={campo}>
              <label htmlFor={`maq-${campo}`}>{etiqueta}</label>
              <input id={`maq-${campo}`} type="number" min={0} max={maximo} step={campo === "oee" ? "0.1" : "1"} required value={formulario[campo]} onChange={(e) => cambiarCampo(campo, Number(e.target.value))} />
            </div>
          ))}
          <button type="submit" className="details-button" disabled={guardando}>{guardando ? "Guardando..." : "Guardar máquina"}</button>
          <button type="button" className="details-button" disabled={guardando} onClick={() => { setMostrarFormulario(false); setError(""); }}>Cancelar</button>
        </form>}
      </main>
    </div>
  );
}
