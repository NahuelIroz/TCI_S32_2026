

import { useState } from "react";
import IncidenciaCard from "../components/IncidenciaCard";
import {
  incidencias,
  type EstadoIncidencia,
} from "../data/incidencias";
import "./styles.css";

interface MisIncidenciasProps {
  onNuevaIncidencia?: () => void;
  onBack?: () => void;
}

type Filtro = "Todas" | EstadoIncidencia;

function MisIncidencias({
  onNuevaIncidencia,
  onBack,
}: MisIncidenciasProps) {

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todas");

  // Opciones de filtrado
  const filtros: Filtro[] = [
    "Todas",
    "Pendiente",
    "En Reparación",
    "Resuelto",
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

        {/* INFORMACIÓN DE LA LÍNEA */}
        <div className="mis-sincronizacion">

          <span>
            🟢 LÍNEA ENVASADO 1-B
          </span>

          <small>Datos de prueba</small>

        </div>

        <section className="mis-listado">

          {incidenciasFiltradas.length > 0 ? (

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
