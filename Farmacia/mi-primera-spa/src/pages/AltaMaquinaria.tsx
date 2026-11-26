import { useState } from "react";
import { type CriticidadMaquina } from "../data/maquinas";
import {
  crearMaquinaConBOM,
  type RepuestoBOMAPI,
} from "../services/maquinasService";
import { servicioNotificaciones } from "../services/notificacionesService";
import "./styles.css";

interface AltaMaquinariaProps {
  onBack?: () => void;
  onExito?: () => void;
}

export default function AltaMaquinaria({ onBack, onExito }: AltaMaquinariaProps) {
  const [codigo, setCodigo] = useState("BLS-ROT-05");
  const [nombre, setNombre] = useState("Blistera Rotativa de Alta Velocidad #05");
  const [tipo, setTipo] = useState("Blistera");
  const [sector, setSector] = useState("Línea de Envasado B");
  const [criticidad, setCriticidad] = useState<CriticidadMaquina>("Crítica");
  const [responsable, setResponsable] = useState("Carlos Gómez");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [repuestosGenerados, setRepuestosGenerados] = useState<RepuestoBOMAPI[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim() || !nombre.trim()) {
      setError("Por favor completá el código y nombre del equipo.");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensajeExito("");

      const respuesta = await crearMaquinaConBOM({
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        tipo: tipo.trim() || "Equipo Industrial",
        sector,
        estado: "Operativa",
        criticidad,
        oee: 92.5,
        temperatura: "45°C",
        presion: "6.2 bar",
        horas_operacion: 0,
        ultima_revision: new Date().toLocaleDateString("es-AR"),
        proximo_mantenimiento: "30/11/2026",
        responsable,
      });

      setRepuestosGenerados(respuesta.repuestos_generados);

      servicioNotificaciones.enviarNotificacion(
        "incidente",
        `🏭 ALTA RN-07: Nueva maquinaria ${nombre} (${codigo}) dada de alta`,
        ["gerencia@planta.farmacia.com", "encargados@planta.farmacia.com"],
        `Se ha incorporado ${nombre} en ${sector}. Se generó la lista de ${respuesta.repuestos_generados.length} repuestos obligatorios para stock de seguridad.`
      );

      setMensajeExito(
        `✓ Máquina ${respuesta.maquina.nombre} registrada en base de datos. Se generaron automáticamente ${respuesta.repuestos_generados.length} repuestos en stock (RN-07).`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo registrar la máquina."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="incidencia-container">
      <header className="incidencia-header">
        <button
          type="button"
          className="boton-volver"
          onClick={onBack}
          aria-label="Volver"
        >
          ←
        </button>
        <h1>Ingreso de Nueva Maquinaria</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado">
          <span className="badge-seccion verde">Regla RN-07 · Alta y BOM de Repuestos</span>
          <p className="subpantalla-descripcion">
            Al registrar una máquina en planta, el sistema genera automáticamente el listado de repuestos críticos y umbrales mínimos a custodiar en depósito.
          </p>
        </div>

        {mensajeExito && (
          <div className="feedback-banner feedback-banner-success" role="status">
            <span>✓</span> {mensajeExito}
          </div>
        )}

        {error && (
          <div className="alerta-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <form className="formulario-delegar-tarea" onSubmit={(e) => void handleSubmit(e)}>
          <h3>Datos del Nuevo Equipo</h3>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="codigoMaq">Código de identificación</label>
              <input
                id="codigoMaq"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="criticidadMaq">Nivel de Criticidad</label>
              <select
                id="criticidadMaq"
                value={criticidad}
                onChange={(e) => setCriticidad(e.target.value as CriticidadMaquina)}
              >
                <option value="Crítica">Crítica (Línea principal)</option>
                <option value="Media">Media (Auxiliar)</option>
                <option value="Baja">Baja (Standby)</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="nombreMaq">Nombre / Descripción de la máquina</label>
              <input
                id="nombreMaq"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="tipoMaq">Tipo de equipo</label>
              <input
                id="tipoMaq"
                type="text"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="sectorMaq">Sector / Línea de planta</label>
              <select
                id="sectorMaq"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                <option value="Línea de Envasado A">Línea de Envasado A</option>
                <option value="Línea de Envasado B">Línea de Envasado B</option>
                <option value="Prensas y Formado">Prensas y Formado</option>
                <option value="Servicios Centrales">Servicios Centrales</option>
                <option value="Zona Estéril">Zona Estéril</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="responsableMaq">Técnico responsable asignado</label>
              <select
                id="responsableMaq"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
              >
                <option value="Carlos Gómez">Carlos Gómez</option>
                <option value="J. Morales">J. Morales</option>
                <option value="M. López">M. López</option>
                <option value="Sin asignar">Sin asignar</option>
              </select>
            </div>
          </div>

          <button type="submit" className="boton-enviar" disabled={guardando}>
            {guardando
              ? "Registrando equipo y repuestos..."
              : "Registrar Máquina y Generar Repuestos (RN-07)"}
          </button>
        </form>

        {repuestosGenerados.length > 0 && (
          <div className="tablero-bloque">
            <h3>Lista de Repuestos a Mantener en Stock (Generada automáticamente)</h3>
            <p className="tablero-subtexto">
              Piezas vinculadas al equipo para garantizar disponibilidad operativa continua:
            </p>

            <div className="pedidos-lista">
              {repuestosGenerados.map((rep) => (
                <div key={rep.codigo} className="pedido-card">
                  <div className="pedido-header">
                    <div>
                      <span className="pedido-id">{rep.codigo}</span>
                      <span className="badge-estado-pedido badge-aprobado">
                        Umbral mínimo: {rep.minimo_sugerido} {rep.unidad}
                      </span>
                    </div>
                  </div>
                  <h4 className="pedido-titulo">{rep.nombre}</h4>
                  <p className="pedido-justificacion">
                    <strong>Ubicación de guardado asignada:</strong> {rep.ubicacion_sugerida}
                  </p>
                </div>
              ))}
            </div>

            {onExito && (
              <button
                type="button"
                className="boton-enviar mt-md"
                onClick={onExito}
              >
                Ver Parque de Máquinas Actualizado →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
