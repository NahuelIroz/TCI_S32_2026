import { useState } from "react";
import "./styles.css";

function ReporteIncidencia() {
  const [maquina, setMaquina] = useState("Compresor 1 (M-001)");
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

    const incidencia = {
      maquina,
      descripcion,
      fotos,
    };

    console.log("Incidencia:", incidencia);

    alert("Incidencia enviada");
  };

  return (
    <div className="incidencia-container">
      <header className="incidencia-header">
        <button
          type="button"
          className="boton-volver"
          onClick={() => window.history.back()}
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