
import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { crearIncidencia } from "../services/incidenciasService";
import type { CrearIncidenciaDTO } from "../services/incidenciasService";

import {
  obtenerMaquinas,
  type MaquinaAPI,
} from "../services/maquinasService";

import "./styles.css";

interface ReporteIncidenciaProps {
  onBack?: () => void;
}

type Turno = CrearIncidenciaDTO["turno"];
type Prioridad = CrearIncidenciaDTO["prioridad"];

function ReporteIncidencia({ onBack }: ReporteIncidenciaProps) {

  // ============================
  // ESTADOS - MÁQUINAS
  // ============================

  const [maquina, setMaquina] = useState("");
  const [maquinas, setMaquinas] = useState<MaquinaAPI[]>([]);
  const [cargandoMaquinas, setCargandoMaquinas] = useState(true);
  const [errorMaquinas, setErrorMaquinas] = useState("");

  // ============================
  // ESTADOS - FORMULARIO
  // ============================

  const [descripcion, setDescripcion] = useState("");
  const [turno, setTurno] = useState<Turno>("Mañana");
  const [prioridad, setPrioridad] = useState<Prioridad>("MEDIA");

  const [fotos, setFotos] = useState<File[]>([]);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [previews, setPreviews] = useState<string[]>([]);


  // ============================
  // CARGAR MÁQUINAS DESDE FASTAPI
  // ============================

  useEffect(() => {
    let activo = true;

    async function cargarMaquinas() {
      try {
        setCargandoMaquinas(true);
        setErrorMaquinas("");

        const datos = await obtenerMaquinas();

        if (!activo) return;

        setMaquinas(datos);

        // Seleccionamos la primera máquina disponible
        if (datos.length > 0) {
          setMaquina(datos[0].codigo);
        } else {
          setMaquina("");
        }

      } catch (err) {
        if (!activo) return;

        setErrorMaquinas(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las máquinas."
        );

      } finally {
        if (activo) {
          setCargandoMaquinas(false);
        }
      }
    }

    cargarMaquinas();

    return () => {
      activo = false;
    };
  }, []);


  // ============================
  // PREVISUALIZACIÓN DE FOTOS
  // ============================

  useEffect(() => {
    const urls = fotos.map((foto) =>
      URL.createObjectURL(foto)
    );

    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fotos]);


  // ============================
  // AGREGAR FOTOS
  // ============================

  const agregarFotos = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const nuevasFotos = Array.from(event.target.files);

      setFotos((anteriores) => [
        ...anteriores,
        ...nuevasFotos,
      ]);

      event.target.value = "";
    }
  };


  // ============================
  // ENVIAR INCIDENCIA A FASTAPI
  // ============================

  const enviarIncidencia = async (event: FormEvent) => {
    event.preventDefault();

    if (enviando) return;

    setError("");
    setMensajeExito("");

    // Validar máquina
    if (
      !maquina ||
      !maquinas.some((item) => item.codigo === maquina)
    ) {
      setError("Seleccioná una máquina válida.");
      return;
    }

    // Validar descripción
    if (!descripcion.trim()) {
      setError(
        "Por favor detallá la falla observada."
      );
      return;
    }

    // Todavía no implementamos adjuntos
    if (fotos.length > 0) {
      setError(
        "La carga de fotografías todavía no está disponible. " +
        "Quitá las fotos para registrar la incidencia."
      );
      return;
    }

    setEnviando(true);

    try {
      const datos: CrearIncidenciaDTO = {
        maquina_codigo: maquina,

        // Usuario de prueba.
        // Se reemplazará al implementar JWT.
        usuario_id: 1,

        descripcion: descripcion.trim(),
        turno,
        prioridad,
      };

      const incidenciaCreada = await crearIncidencia(datos);

      setMensajeExito(
        `Incidencia ${incidenciaCreada.codigo} registrada correctamente.`
      );

      // Limpiar formulario
      setDescripcion("");
      setFotos([]);
      setPrioridad("MEDIA");

      alert(
        `✓ Incidencia ${incidenciaCreada.codigo} registrada correctamente.`
      );

      // Volver a la pantalla anterior
      onBack?.();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar la incidencia."
      );

    } finally {
      setEnviando(false);
    }
  };


  // ============================
  // INTERFAZ
  // ============================

  return (
    <div className="incidencia-container">

      {/* ENCABEZADO */}
      <header className="incidencia-header">

        <button
          type="button"
          className="boton-volver"
          onClick={
            onBack ?? (() => window.history.back())
          }
        >
          ←
        </button>

        <h1>Nueva incidencia</h1>

      </header>


      <form
        className="incidencia-form"
        onSubmit={enviarIncidencia}
      >

        {/* ============================
            MÁQUINA / EQUIPO
        ============================ */}

        <div className="campo">

          <label htmlFor="maquina">
            Máquina / Equipo
          </label>

          <select
            id="maquina"
            value={maquina}
            onChange={(e) =>
              setMaquina(e.target.value)
            }
            disabled={
              enviando ||
              cargandoMaquinas ||
              maquinas.length === 0
            }
            required
          >

            {maquinas.length === 0 && (
              <option value="">
                {cargandoMaquinas
                  ? "Cargando máquinas..."
                  : "No hay máquinas disponibles"}
              </option>
            )}

            {maquinas.map((item) => (
              <option
                key={item.id}
                value={item.codigo}
              >
                {item.nombre} ({item.codigo})
              </option>
            ))}

          </select>

          {errorMaquinas && (
            <small
              role="alert"
              style={{ color: "#dc3545" }}
            >
              {errorMaquinas}
            </small>
          )}

        </div>


        {/* ============================
            TURNO
        ============================ */}

        <div className="campo">

          <label htmlFor="turno">
            Turno
          </label>

          <select
            id="turno"
            value={turno}
            onChange={(e) =>
              setTurno(e.target.value as Turno)
            }
            disabled={enviando}
          >
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Noche">Noche</option>
          </select>

        </div>


        {/* ============================
            PRIORIDAD
        ============================ */}

        <div className="campo">

          <label htmlFor="prioridad">
            Prioridad
          </label>

          <select
            id="prioridad"
            value={prioridad}
            onChange={(e) =>
              setPrioridad(e.target.value as Prioridad)
            }
            disabled={enviando}
          >
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica</option>
          </select>

        </div>


        {/* ============================
            DESCRIPCIÓN
        ============================ */}

        <div className="campo">

          <label htmlFor="descripcion">
            Descripción
          </label>

          <textarea
            id="descripcion"
            placeholder="Describa el problema..."
            value={descripcion}
            onChange={(e) =>
              setDescripcion(e.target.value)
            }
            disabled={enviando}
            required
          />

        </div>


        {/* ============================
            FOTOGRAFÍAS
        ============================ */}

        <div className="campo">

          <label>
            Fotos (opcional)
          </label>

          <div className="fotos-container">

            {previews.map((url, index) => (

              <div
                className="foto-preview"
                key={url}
              >

                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setFotos((anteriores) =>
                      anteriores.filter(
                        (_, i) => i !== index
                      )
                    )
                  }
                  disabled={enviando}
                  aria-label={`Quitar foto ${index + 1}`}
                >
                  ×
                </button>

              </div>

            ))}

            <label className="agregar-foto">
              +

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={agregarFotos}
                disabled={enviando}
                hidden
              />

            </label>

          </div>

          <small>
            La carga de fotografías se habilitará próximamente.
          </small>

        </div>


        {/* ============================
            MENSAJES
        ============================ */}

        {error && (
          <p
            role="alert"
            style={{ color: "#dc3545" }}
          >
            {error}
          </p>
        )}

        {mensajeExito && (
          <p
            role="status"
            style={{ color: "#198754" }}
          >
            {mensajeExito}
          </p>
        )}


        {/* ============================
            BOTÓN ENVIAR
        ============================ */}

        <button
          type="submit"
          className="details-button"
          disabled={
            enviando ||
            cargandoMaquinas ||
            maquinas.length === 0
          }
        >
          {enviando
            ? "Registrando incidencia..."
            : "Enviar incidencia"}
        </button>

      </form>

    </div>
  );
}

export default ReporteIncidencia;

