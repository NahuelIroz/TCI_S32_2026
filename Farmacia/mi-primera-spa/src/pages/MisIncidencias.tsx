
import { useEffect, useState } from "react";

import IncidenciaCard from "../components/IncidenciaCard";

import type {
  Incidencia,
  EstadoIncidencia,
} from "../data/incidencias";

import {
  obtenerIncidencias,
  type IncidenciaAPI,
  type EstadoIncidenciaAPI,
} from "../services/incidenciasService";

import {
  obtenerMaquinas,
  type MaquinaAPI,
} from "../services/maquinasService";

import "./styles.css";


interface MisIncidenciasProps {
  onNuevaIncidencia?: () => void;
  onBack?: () => void;
}

type Filtro = "Todas" | EstadoIncidencia;


// ============================
// TRADUCCIÓN DE ESTADOS
// ============================

const estadosFrontend: Record<
  EstadoIncidenciaAPI,
  EstadoIncidencia
> = {
  REPORTADA: "Reportada",
  EN_TRIAGE: "En triage",
  EN_REPARACION: "En reparación",
  RESUELTA: "Resuelta",
  CERRADA: "Cerrada",
  RECHAZADA: "Rechazada",
};


// ============================
// ADAPTAR INCIDENCIA
// ============================

function adaptarIncidencia(
  incidencia: IncidenciaAPI,
  maquinas: MaquinaAPI[]
): Incidencia {

  // Buscar la máquina correspondiente a la incidencia
  const maquina = maquinas.find(
    (item) => item.id === incidencia.maquina_id
  );

  return {
    id: incidencia.id,
    codigo: incidencia.codigo,

    // Nombre real obtenido desde PostgreSQL
    maquina: maquina?.nombre ?? `Máquina #${incidencia.maquina_id}`,

    // Código real obtenido desde PostgreSQL
    codigoMaquina: maquina?.codigo ?? `ID ${incidencia.maquina_id}`,

    descripcion: incidencia.descripcion,

    fecha: new Date(
      incidencia.fecha_reporte
    ).toLocaleString("es-AR"),

    estado: estadosFrontend[incidencia.estado],

    turno: incidencia.turno,

    // Todavía no tenemos asignación de técnicos
    tecnico: "Sin asignar",

    // Todavía no implementamos adjuntos en el backend
    adjuntos: 0,
  };
}


// ============================
// COMPONENTE PRINCIPAL
// ============================

function MisIncidencias({
  onNuevaIncidencia,
  onBack,
}: MisIncidenciasProps) {

  // ============================
  // ESTADOS
  // ============================

  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todas");


  // ============================
  // CARGAR DATOS DESDE FASTAPI
  // ============================

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        setCargando(true);
        setError(null);

        // Consultamos incidencias y máquinas en paralelo
        const [datosIncidencias, datosMaquinas] = await Promise.all([
          obtenerIncidencias(),
          obtenerMaquinas(),
        ]);

        if (!activo) return;

        // Relacionamos cada incidencia con su máquina
        const incidenciasAdaptadas = datosIncidencias.map(
          (incidencia) =>
            adaptarIncidencia(incidencia, datosMaquinas)
        );

        setIncidencias(incidenciasAdaptadas);

      } catch (err) {
        if (!activo) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las incidencias."
        );

      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);


  // ============================
  // FILTROS DISPONIBLES
  // ============================

  const filtros: Filtro[] = [
    "Todas",
    "Reportada",
    "En triage",
    "En reparación",
    "Resuelta",
    "Cerrada",
    "Rechazada",
  ];


  // ============================
  // FILTRAR INCIDENCIAS
  // ============================

  const incidenciasFiltradas = incidencias.filter((inc) => {

    const coincideEstado =
      filtro === "Todas" || inc.estado === filtro;

    const texto = busqueda.trim().toLowerCase();

    const coincideBusqueda =
      inc.codigo.toLowerCase().includes(texto) ||
      inc.maquina.toLowerCase().includes(texto) ||
      inc.descripcion.toLowerCase().includes(texto) ||
      inc.codigoMaquina.toLowerCase().includes(texto);

    return coincideEstado && coincideBusqueda;
  });


  // ============================
  // INTERFAZ
  // ============================

  return (
    <div className="incidencia-container mis-incidencias">

      {/* ENCABEZADO */}
      <header className="incidencia-header">

        <button
          type="button"
          className="boton-volver"
          onClick={onBack}
          aria-label="Volver"
        >
          ←
        </button>

        <h1>Mis incidencias</h1>

      </header>


      <main className="incidencia-form mis-contenido">

        {/* ============================
            BUSCADOR
        ============================ */}

        <div className="campo mis-buscador">

          <label htmlFor="buscar-incidencia">
            Buscar incidencia
          </label>

          <input
            id="buscar-incidencia"
            type="search"
            placeholder="Código, máquina o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

        </div>


        {/* ============================
            FILTROS POR ESTADO
        ============================ */}

        <div
          className="mis-filtros"
          aria-label="Filtrar incidencias por estado"
        >

          {filtros.map((item) => (

            <button
              type="button"
              key={item}
              className={
                filtro === item
                  ? "filtro activo"
                  : "filtro"
              }
              aria-pressed={filtro === item}
              onClick={() => setFiltro(item)}
            >

              {item}

              {item === "Todas" && (
                <span className="filtro-cantidad">
                  {incidencias.length}
                </span>
              )}

            </button>

          ))}

        </div>


        {/* ============================
            INFORMACIÓN DE CONEXIÓN
        ============================ */}

        <div className="mis-sincronizacion">

          {cargando ? (
            <span>🟡 Cargando datos...</span>
          ) : error ? (
            <span>🔴 Error de conexión</span>
          ) : (
            <>
              <span>
                🟢 CONECTADO A FARMACIA API
              </span>

              <small>Datos desde PostgreSQL</small>
            </>
          )}

        </div>


        {/* ============================
            LISTADO DE INCIDENCIAS
        ============================ */}

        <section className="mis-listado">

          {cargando ? (

            <p className="mis-vacio">
              Cargando incidencias...
            </p>

          ) : error ? (

            <p className="mis-vacio" role="alert">
              Error al cargar incidencias: {error}
            </p>

          ) : incidenciasFiltradas.length > 0 ? (

            incidenciasFiltradas.map((incidencia) => (

              <IncidenciaCard
                key={incidencia.id}
                incidencia={incidencia}
                onDetalle={(inc) => {
                  alert(`Detalle de ${inc.codigo}`);
                }}
              />

            ))

          ) : (

            <p className="mis-vacio">
              No se encontraron incidencias.
            </p>

          )}

        </section>


        {/* ============================
            NUEVA INCIDENCIA
        ============================ */}

        <button
          type="button"
          className="details-button"
          onClick={onNuevaIncidencia}
        >
          + Nueva incidencia
        </button>

      </main>

    </div>
  );
}

export default MisIncidencias;


