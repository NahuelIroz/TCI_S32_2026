
import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { crearIncidencia } from "../services/incidenciasService";
import type { CrearIncidenciaDTO } from "../services/incidenciasService";

import "./styles.css";

interface ReporteIncidenciaProps {
  onBack?: () => void;
}

type Turno = CrearIncidenciaDTO["turno"];
type Prioridad = CrearIncidenciaDTO["prioridad"];

function ReporteIncidencia({ onBack }: ReporteIncidenciaProps) {

  // Máquina existente en PostgreSQL
  const [maquina, setMaquina] = useState("SEC-ENV-03");

  const [descripcion, setDescripcion] = useState("");
  const [turno, setTurno] = useState<Turno>("Mañana");
  const [prioridad, setPrioridad] = useState<Prioridad>("MEDIA");

  const [fotos, setFotos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = fotos.map((foto) => URL.createObjectURL(foto));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fotos]);


  const agregarFotos = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const nuevasFotos = Array.from(event.target.files);

      setFotos((anteriores) => [
        ...anteriores,
        ...nuevasFotos,
      ]);

      event.target.value = "";
    }
  };


  const enviarIncidencia = async (event: FormEvent) => {
    event.preventDefault();

    if (enviando) return;

    if (!descripcion.trim()) {
      setError("Por favor detallá la falla observada.");
      return;
    }

    // Las fotos todavía no se pueden guardar en el backend
    if (fotos.length > 0) {
      setError(
        "La carga de fotografías todavía no está disponible. " +
        "Quitá las fotos para registrar la incidencia."
      );
      return;
    }

    setEnviando(true);
    setError("");
    setMensajeExito("");

    try {
      const datos: CrearIncidenciaDTO = {
        maquina_codigo: maquina,
        usuario_id: 1, // Usuario de prueba hasta implementar JWT
        descripcion: descripcion.trim(),
        turno,
        prioridad,
      };

      const incidenciaCreada = await crearIncidencia(datos);

      setMensajeExito(
        `Incidencia ${incidenciaCreada.codigo} registrada correctamente.`
      );

      setDescripcion("");
      setFotos([]);
      setPrioridad("MEDIA");

      // Volver al listado después del registro
      // El usuario verá la confirmación antes de volver
      alert(
        `✓ Incidencia ${incidenciaCreada.codigo} registrada correctamente en PostgreSQL.`
      );

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


  return (
    <div className="incidencia-container">

      <header className="incidencia-header">

        <button
          type="button"
          className="boton-volver"
          onClick={onBack ?? (() => window.history.back())}
        >
          ←
        </button>

        <h1>Nueva incidencia</h1>

      </header>


      <form
        className="incidencia-form"
        onSubmit={enviarIncidencia}
      >

        <div className="campo">

          <label htmlFor="maquina">
            Máquina / Equipo
          </label>

          <select
            id="maquina"
            value={maquina}
            onChange={(e) => setMaquina(e.target.value)}
            disabled={enviando}
          >
            <option value="SEC-ENV-03">
              Envasadora Rotativa #03 (SEC-ENV-03)
            </option>
          </select>

        </div>


        <div className="campo">

          <label htmlFor="turno">Turno</label>

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


        <div className="campo">

          <label htmlFor="prioridad">Prioridad</label>

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


        <div className="campo">

          <label>Fotos (opcional)</label>

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
                      anteriores.filter((_, i) => i !== index)
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


        {error && (
          <p role="alert" style={{ color: "#dc3545" }}>
            {error}
          </p>
        )}

        {mensajeExito && (
          <p role="status" style={{ color: "#198754" }}>
            {mensajeExito}
          </p>
        )}


        <button
          type="submit"
          className="details-button"
          disabled={enviando}
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
