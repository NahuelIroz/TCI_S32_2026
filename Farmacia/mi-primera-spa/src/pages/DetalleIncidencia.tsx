
import { useEffect, useState } from "react";

import {
  obtenerIncidenciaPorId,
  obtenerFotosIncidencia,
  urlFotoIncidencia,
  type FotoIncidenciaAPI,
  cambiarEstadoIncidencia,
  type IncidenciaAPI,
  type EstadoIncidenciaAPI,
} from "../services/incidenciasService";

import {
  obtenerMaquinaPorId,
  type MaquinaAPI,
} from "../services/maquinasService";

import type { RolUsuario } from "../auth/permisos";

import {
  obtenerEstadosPermitidos,
} from "../auth/permisosIncidencias";

import "./styles.css";

// ==========================================
// PROPIEDADES DEL COMPONENTE
// ==========================================

interface DetalleIncidenciaProps {
  incidenciaId: number;
  rolUsuario: RolUsuario;
  onBack: () => void;
}

// ==========================================
// NOMBRES DE LOS ESTADOS
// ==========================================

const nombresEstado: Record<EstadoIncidenciaAPI, string> = {
  REPORTADA: "Reportada",
  EN_TRIAGE: "En triage",
  EN_REPARACION: "En reparación",
  RESUELTA: "Resuelta",
  CERRADA: "Cerrada",
  RECHAZADA: "Rechazada",
};

// ==========================================
// COMPONENTE
// ==========================================

function DetalleIncidencia({
  incidenciaId,
  rolUsuario,
  onBack,
}: DetalleIncidenciaProps) {

  const [fotos, setFotos] = useState<FotoIncidenciaAPI[]>([]);
  const [errorFotos, setErrorFotos] = useState("");

  // Datos de la incidencia
  const [incidencia, setIncidencia] =
    useState<IncidenciaAPI | null>(null);

  // Datos de la máquina asociada
  const [maquina, setMaquina] =
    useState<MaquinaAPI | null>(null);

  // Estados de carga
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estados para actualizar la incidencia
  const [nuevoEstado, setNuevoEstado] =
    useState<EstadoIncidenciaAPI | "">("");

  const [guardandoEstado, setGuardandoEstado] =
    useState(false);

  const [errorEstado, setErrorEstado] = useState("");
  const [mensajeEstado, setMensajeEstado] = useState("");

  // ==========================================
  // ESTADOS PERMITIDOS SEGÚN EL ROL
  // ==========================================

  const estadosDisponibles = incidencia
    ? obtenerEstadosPermitidos(
        incidencia.estado,
        rolUsuario
      )
    : [];

  // ==========================================
  // CARGAR DETALLE DE INCIDENCIA
  // ==========================================

  useEffect(() => {
    let activo = true;

    async function cargarDetalle() {
      try {
        setCargando(true);
        setError("");

        setIncidencia(null);
        setMaquina(null);
        setFotos([]);
        setErrorFotos("");

        setNuevoEstado("");
        setErrorEstado("");
        setMensajeEstado("");

        // Obtener incidencia desde FastAPI
        const datosIncidencia =
          await obtenerIncidenciaPorId(incidenciaId);

        // Obtener máquina asociada desde FastAPI
        const datosMaquina =
          await obtenerMaquinaPorId(
            datosIncidencia.maquina_id
          );

        if (!activo) return;

        setIncidencia(datosIncidencia);
        setMaquina(datosMaquina);
        try {
          const fotosGuardadas = await obtenerFotosIncidencia(incidenciaId);
          if (activo) setFotos(fotosGuardadas);
        } catch (err) {
          if (activo) setErrorFotos(err instanceof Error ? err.message : "No se pudieron cargar las fotografías.");
        }

      } catch (err) {
        if (!activo) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el detalle."
        );

      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarDetalle();

    return () => {
      activo = false;
    };

  }, [incidenciaId]);

  // ==========================================
  // GUARDAR CAMBIO DE ESTADO
  // ==========================================

  const guardarCambioEstado = async () => {

    if (!incidencia || !nuevoEstado || guardandoEstado) {
      return;
    }

    // Validar que el rol tenga permiso
    // para realizar esta transición
    if (!estadosDisponibles.includes(nuevoEstado)) {
      setErrorEstado(
        "Tu perfil no tiene permisos para realizar este cambio de estado."
      );
      return;
    }

    setGuardandoEstado(true);
    setErrorEstado("");
    setMensajeEstado("");

    try {

      // PATCH al backend
      const incidenciaActualizada =
        await cambiarEstadoIncidencia(
          incidencia.id,
          nuevoEstado
        );

      // Actualizar información en pantalla
      setIncidencia(incidenciaActualizada);

      // Limpiar selector
      setNuevoEstado("");

      setMensajeEstado(
        "El estado de la incidencia se actualizó correctamente."
      );

    } catch (err) {

      setErrorEstado(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado."
      );

    } finally {
      setGuardandoEstado(false);
    }
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="incidencia-container">

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

        <h1>Detalle de incidencia</h1>

      </header>

      <main className="incidencia-form">

        {cargando ? (

          <p>Cargando detalle...</p>

        ) : error ? (

          <p role="alert" style={{ color: "#dc3545" }}>
            {error}
          </p>

        ) : incidencia ? (

          <div className="detalle-incidencia">

            {/* ======================================
                CÓDIGO Y ESTADO
            ====================================== */}

            <div className="detalle-encabezado">

              <h2>{incidencia.codigo}</h2>

              <span className="detalle-estado">
                {nombresEstado[incidencia.estado]}
              </span>

            </div>

            <hr />

            {/* ======================================
                MÁQUINA
            ====================================== */}

            <div className="campo">

              <strong>Máquina / Equipo</strong>

              <p>
                {maquina?.nombre ??
                  `Máquina #${incidencia.maquina_id}`}
              </p>

              <small>
                {maquina?.codigo ?? "Sin código"}
              </small>

            </div>

            {/* ======================================
                INFORMACIÓN GENERAL
            ====================================== */}

            <div className="detalle-grid">

              <div className="campo">
                <strong>Prioridad</strong>
                <p>{incidencia.prioridad}</p>
              </div>

              <div className="campo">
                <strong>Turno</strong>
                <p>{incidencia.turno}</p>
              </div>

              <div className="campo">
                <strong>Fecha de reporte</strong>

                <p>
                  {new Date(
                    incidencia.fecha_reporte
                  ).toLocaleString("es-AR")}
                </p>
              </div>

              <div className="campo">
                <strong>Estado</strong>

                <p>
                  {nombresEstado[incidencia.estado]}
                </p>
              </div>

            </div>

            <hr />

            {/* ======================================
                DESCRIPCIÓN
            ====================================== */}

            <div className="campo">

              <strong>Descripción de la falla</strong>

              <p>{incidencia.descripcion}</p>

            </div>

            <div className="campo">
              <strong>Fotografías de la incidencia</strong>
              {errorFotos && <p role="alert" style={{ color: "#dc3545" }}>{errorFotos}</p>}
              {!errorFotos && fotos.length === 0 && <p>Sin fotografías adjuntas.</p>}
              <div className="fotos-container">
                {fotos.map((foto) => (
                  <a key={foto.id} href={urlFotoIncidencia(foto.url)} target="_blank" rel="noreferrer" aria-label={`Ampliar fotografía ${foto.id}`}>
                    <img src={urlFotoIncidencia(foto.url)} alt={`Fotografía de la incidencia ${incidencia.codigo}`} style={{ width: 130, height: 130, objectFit: "cover", borderRadius: 8 }} />
                  </a>
                ))}
              </div>
            </div>

            {/* ======================================
                TÉCNICO
            ====================================== */}

            <div className="campo">

              <strong>Técnico asignado</strong>

              <p>Sin asignar</p>

            </div>

            <hr />

            {/* ======================================
                ACTUALIZAR ESTADO
            ====================================== */}

            <div className="campo">

              <h3>Actualizar estado</h3>

              {estadosDisponibles.length > 0 ? (

                <>

                  <label htmlFor="nuevoEstado">
                    Seleccionar nuevo estado
                  </label>

                  <select
                    id="nuevoEstado"
                    value={nuevoEstado}
                    onChange={(e) => {

                      setNuevoEstado(
                        e.target.value as
                          | EstadoIncidenciaAPI
                          | ""
                      );

                      setErrorEstado("");
                      setMensajeEstado("");

                    }}
                    disabled={guardandoEstado}
                  >

                    <option value="">
                      Seleccionar estado...
                    </option>

                    {estadosDisponibles.map((estado) => (

                      <option
                        key={estado}
                        value={estado}
                      >
                        {nombresEstado[estado]}
                      </option>

                    ))}

                  </select>

                  <button
                    type="button"
                    className="details-button"
                    onClick={guardarCambioEstado}
                    disabled={
                      !nuevoEstado || guardandoEstado
                    }
                  >
                    {guardandoEstado
                      ? "Guardando..."
                      : "Guardar cambio de estado"}
                  </button>

                </>

              ) : (

                <p>
                  {incidencia.estado === "CERRADA" ||
                  incidencia.estado === "RECHAZADA"
                    ? "Esta incidencia se encuentra en un estado final y no permite más cambios."
                    : "No hay cambios de estado disponibles para tu perfil en esta etapa."}
                </p>

              )}

              {/* ERROR AL GUARDAR */}
              {errorEstado && (

                <p
                  role="alert"
                  style={{ color: "#dc3545" }}
                >
                  {errorEstado}
                </p>

              )}

              {/* MENSAJE DE ÉXITO */}
              {mensajeEstado && (

                <p
                  role="status"
                  style={{ color: "#198754" }}
                >
                  {mensajeEstado}
                </p>

              )}

            </div>

            <hr />

            {/* ======================================
                VOLVER
            ====================================== */}

            <button
              type="button"
              className="details-button"
              onClick={onBack}
            >
              Volver a mis incidencias
            </button>

          </div>

        ) : (

          <p>No se encontró la incidencia.</p>

        )}

      </main>

    </div>
  );
}

export default DetalleIncidencia;


