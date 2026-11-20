import { useEffect, useState } from "react";
import IncidenciaCard from "../components/IncidenciaCard";
import type { Incidencia, EstadoIncidencia } from "../data/incidencias";
import { obtenerIncidencias, type IncidenciaAPI, type EstadoIncidenciaAPI } from "../services/incidenciasService";
import { obtenerMaquinas, type MaquinaAPI } from "../services/maquinasService";
import "./styles.css";

interface Props {
  onBack: () => void;
  onVerDetalle: (id: number) => void;
}

const nombresEstado: Record<EstadoIncidenciaAPI, EstadoIncidencia> = {
  REPORTADA: "Reportada",
  EN_TRIAGE: "En triage",
  EN_REPARACION: "En reparación",
  RESUELTA: "Resuelta",
  CERRADA: "Cerrada",
  RECHAZADA: "Rechazada",
};

function adaptar(inc: IncidenciaAPI, maquinas: MaquinaAPI[]): Incidencia {
  const maquina = maquinas.find((m) => m.id === inc.maquina_id);
  return {
    id: inc.id,
    codigo: inc.codigo,
    maquina: maquina?.nombre ?? `Máquina #${inc.maquina_id}`,
    codigoMaquina: maquina?.codigo ?? `ID ${inc.maquina_id}`,
    descripcion: inc.descripcion,
    fecha: new Date(inc.fecha_reporte).toLocaleString("es-AR"),
    estado: nombresEstado[inc.estado],
    turno: inc.turno,
    tecnico: "Sin asignar",
    adjuntos: 0,
  };
}

const filtros: Array<"Todas" | EstadoIncidencia> = [
  "Todas", "Reportada", "En triage", "En reparación", "Resuelta", "Cerrada", "Rechazada",
];

export default function GestionIncidencias({ onBack, onVerDetalle }: Props) {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"Todas" | EstadoIncidencia>("Todas");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      setCargando(true);
      setError("");
      try {
        const [datos, maquinas] = await Promise.all([obtenerIncidencias(), obtenerMaquinas()]);
        if (activo) setIncidencias(datos.map((inc) => adaptar(inc, maquinas)));
      } catch (err) {
        if (activo) setError(err instanceof Error ? err.message : "No se pudieron cargar las incidencias.");
      } finally {
        if (activo) setCargando(false);
      }
    }
    void cargar();
    return () => { activo = false; };
  }, [recarga]);

  const visibles = incidencias.filter((inc) => {
    const texto = busqueda.trim().toLowerCase();
    return (filtro === "Todas" || inc.estado === filtro) &&
      [inc.codigo, inc.maquina, inc.codigoMaquina, inc.descripcion]
        .some((valor) => valor.toLowerCase().includes(texto));
  });

  return (
    <div className="incidencia-container mis-incidencias">
      <header className="incidencia-header">
        <button type="button" className="boton-volver" onClick={onBack} aria-label="Volver">←</button>
        <h1>Gestión de incidencias</h1>
      </header>
      <main className="incidencia-form mis-contenido">
        <div className="campo mis-buscador">
          <label htmlFor="buscar-gestion-incidencia">Buscar incidencia</label>
          <input id="buscar-gestion-incidencia" type="search" value={busqueda}
            placeholder="Código, máquina o descripción..." onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="mis-filtros" aria-label="Filtrar por estado">
          {filtros.map((item) => (
            <button key={item} type="button" className={filtro === item ? "filtro activo" : "filtro"}
              aria-pressed={filtro === item} onClick={() => setFiltro(item)}>
              {item}{item === "Todas" && <span className="filtro-cantidad">{incidencias.length}</span>}
            </button>
          ))}
        </div>
        <div className="mis-sincronizacion">
          {cargando ? "Cargando datos..." : error ? "Error de conexión" : "Conectado a Farmacia API · Datos desde PostgreSQL"}
        </div>
        <button type="button" className="details-button" onClick={() => setRecarga((n) => n + 1)} disabled={cargando}>
          Actualizar listado
        </button>
        <section className="mis-listado">
          {cargando ? <p className="mis-vacio">Cargando incidencias...</p>
            : error ? <p className="mis-vacio" role="alert">{error}</p>
            : visibles.length ? visibles.map((inc) => (
              <IncidenciaCard key={inc.id} incidencia={inc} onDetalle={(seleccionada) => onVerDetalle(seleccionada.id)} />
            )) : <p className="mis-vacio">No se encontraron incidencias.</p>}
        </section>
      </main>
    </div>
  );
}