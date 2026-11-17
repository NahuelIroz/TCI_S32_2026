
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

import "./styles.css";


interface MisIncidenciasProps {
  onNuevaIncidencia?: () => void;
  onBack?: () => void;
}

type Filtro = "Todas" | EstadoIncidencia;


// Traducimos los estados del backend al frontend
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


// Adaptamos la respuesta de FastAPI al formato de las tarjetas
function adaptarIncidencia(
  incidencia: IncidenciaAPI
): Incidencia {
  return {
    id: incidencia.id,
    codigo: incidencia.codigo,
    maquina: `Máquina #${incidencia.maquina_id}`,
    codigoMaquina: `ID ${incidencia.maquina_id}`,
    descripcion: incidencia.descripcion,
    fecha: new Date(
      incidencia.fecha_reporte
    ).toLocaleString("es-AR"),
    estado: estadosFrontend[incidencia.estado],
    turno: incidencia.turno,
    tecnico: "Sin asignar",
    adjuntos: 0,
  };
}


function MisIncidencias({
  onNuevaIncidencia,
  onBack,
}: MisIncidenciasProps) {

  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todas");


  // Cargar incidencias desde FastAPI
  useEffect(() => {
    let activo = true;

    async function cargarIncidencias() {
      try {
        setCargando(true);
        setError(null);

        const datos = await obtenerIncidencias();

        if (activo) {
          setIncidencias(datos.map(adaptarIncidencia));
        }

      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las incidencias"
          );
        }

      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarIncidencias();

    return () => {
      activo = false;
    };
  }, []);


  const filtros: Filtro[] = [
    "Todas",
    "Reportada",
    "En triage",
    "En reparación",
    "Resuelta",
    "Cerrada",
    "Rechazada",
  ];


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


  return (
    <div className="incidencia-container mis-incidencias">

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


        {/* INFORMACIÓN DE SINCRONIZACIÓN */}
        <div className="mis-sincronizacion">

          <span>
            🟢 CONECTADO A FARMACIA API
          </span>

          <small>Datos desde PostgreSQL</small>

        </div>


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

