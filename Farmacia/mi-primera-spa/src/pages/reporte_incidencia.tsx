import { useState } from "react";
import { incidencias, type Incidencia } from "../data/incidencias";
import { servicioNotificaciones } from "../services/notificacionesService";
import "./styles.css";

interface ReporteIncidenciaProps {
  onBack?: () => void;
}

function ReporteIncidencia({ onBack }: ReporteIncidenciaProps) {
  const [maquina, setMaquina] = useState("Envasadora Rotativa #03");
  const [descripcion, setDescripcion] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [turno, setTurno] = useState("Mañana");

  const agregarFotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const nuevasFotos = Array.from(event.target.files);
      setFotos((anteriores) => [...anteriores, ...nuevasFotos]);
    }
  };

  const enviarIncidencia = (event: React.FormEvent) => {
    event.preventDefault();

    if (!descripcion.trim()) {
      alert("Por favor detallá la descripción de la falla observada.");
      return;
    }

    const nueva: Incidencia = {
      id: Date.now(),
      codigo: `INC-10${incidencias.length + 45}`,
      maquina,
      codigoMaquina: maquina.includes("Envasadora")
        ? "SEC-ENV-03"
        : maquina.includes("Prensa")
        ? "HYD-PRE-12"
        : "CMP-CTR-01",
      descripcion,
      fecha: "Recién",
      estado: "Pendiente",
      turno,
      tecnico: "Sin asignar",
      adjuntos: fotos.length,
    };

    incidencias.unshift(nueva);

    // RN-09: Notificación por correo de incidente reportado
    servicioNotificaciones.enviarNotificacion(
      "incidente",
      `INCIDENTE RN-09: Falla reportada en ${maquina} (${nueva.codigo})`,
      ["mantenimiento@planta.farmacia.com", "supervisores@planta.farmacia.com"],
      `Turno ${turno}: ${descripcion}. Requiere inspección técnica urgente.`
    );

    alert(`✓ Incidencia ${nueva.codigo} registrada. Se notificó al equipo de mantenimiento por correo (RN-09).`);
    if (onBack) onBack();
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

      <form className="incidencia-form" onSubmit={enviarIncidencia}>
        <div className="campo">
          <label htmlFor="maquina">Máquina / Equipo</label>

          <select
            id="maquina"
            value={maquina}
            onChange={(e) => setMaquina(e.target.value)}
          >
            <option>Compresor 1 (M-001)</option>
            <option>Compresor 2 (M-002)</option>
            <option>Bomba hidráulica (M-003)</option>
          </select>
        </div>

        <div className="campo">
            <label htmlFor="turno">Turno</label>

            <select
                id="turno"
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
            >
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
            </select>
        </div>

        <div className="campo">
          <label htmlFor="descripcion">Descripción</label>

          <textarea
            id="descripcion"
            placeholder="Describa el problema..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="campo">
          <label>Fotos (opcional)</label>

          <div className="fotos-container">
            {fotos.map((foto, index) => (
              <div className="foto-preview" key={index}>
                <img
                  src={URL.createObjectURL(foto)}
                  alt={`Foto ${index + 1}`}
                />
              </div>
            ))}

            <label className="agregar-foto">
              +
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={agregarFotos}
                hidden
              />
            </label>
          </div>
        </div>

        <button type="submit" className="details-button">
          Enviar incidencia
        </button>
      </form>
    </div>
  );
}

export default ReporteIncidencia;