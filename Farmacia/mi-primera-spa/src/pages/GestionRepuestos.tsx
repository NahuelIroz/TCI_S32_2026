
import { useCallback, useEffect, useState } from "react";
import {
  listarRepuestosGestion,
  crearRepuesto,
  editarRepuesto,
  cambiarActivoRepuesto,
  type RepuestoGestion,
  type RepuestoGestionCreate,
} from "../services/repuestosService";
import "./styles.css";

interface Props {
  onBack: () => void;
}

const formularioInicial: RepuestoGestionCreate = {
  codigo: "",
  nombre: "",
  minimo: 0,
  unidad: "unid.",
  ubicacion: "Sin ubicación",
};

type Filtro = "activos" | "inactivos" | "todos";

export default function GestionRepuestos({ onBack }: Props) {
  const [repuestos, setRepuestos] = useState<RepuestoGestion[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("activos");
  const [editando, setEditando] = useState<RepuestoGestion | null>(null);
  const [formulario, setFormulario] =
    useState<RepuestoGestionCreate>({ ...formularioInicial });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const datos = await listarRepuestosGestion();
      setRepuestos(datos);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los repuestos."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const visibles = repuestos.filter((r) => {
    const texto = busqueda.trim().toLowerCase();

    const coincide =
      r.codigo.toLowerCase().includes(texto) ||
      r.nombre.toLowerCase().includes(texto);

    const coincideEstado =
      filtro === "todos" ||
      (filtro === "activos" && r.activo) ||
      (filtro === "inactivos" && !r.activo);

    return coincide && coincideEstado;
  });

  function nuevo() {
    setEditando(null);
    setFormulario({ ...formularioInicial });
    setError("");
    setMensaje("");
    setMostrarFormulario(true);
  }

  function editar(repuesto: RepuestoGestion) {
    setEditando(repuesto);
    setFormulario({
      codigo: repuesto.codigo,
      nombre: repuesto.nombre,
      minimo: repuesto.minimo,
      unidad: repuesto.unidad,
      ubicacion: repuesto.ubicacion,
    });
    setError("");
    setMensaje("");
    setMostrarFormulario(true);
  }

  function cambiarCampo<K extends keyof RepuestoGestionCreate>(
    campo: K,
    valor: RepuestoGestionCreate[K]
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      if (editando) {
        await editarRepuesto(editando.id, formulario);
        setMensaje("Repuesto actualizado correctamente.");
      } else {
        await crearRepuesto(formulario);
        setMensaje("Repuesto creado correctamente.");
      }

      setMostrarFormulario(false);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(repuesto: RepuestoGestion) {
    const accion = repuesto.activo ? "desactivar" : "reactivar";

    if (!window.confirm(
      `¿Querés ${accion} el repuesto ${repuesto.codigo}?`
    )) {
      return;
    }

    setError("");
    setMensaje("");

    try {
      await cambiarActivoRepuesto(repuesto.id, !repuesto.activo);
      setMensaje(`Repuesto ${repuesto.activo ? "desactivado" : "reactivado"}.`);
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar."
      );
    }
  }

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
        <h1>Gestión de repuestos</h1>
      </header>

      <main className="incidencia-form mis-contenido">
        {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
        {mensaje && <p role="status" style={{ color: "#047857" }}>{mensaje}</p>}

        {!mostrarFormulario ? (
          <>
            <div className="campo mis-buscador">
              <label htmlFor="buscar-repuesto">Buscar repuesto</label>
              <input
                id="buscar-repuesto"
                type="search"
                placeholder="Código o nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="mis-filtros">
              {(["activos", "inactivos", "todos"] as Filtro[]).map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  className={filtro === opcion ? "filtro activo" : "filtro"}
                  onClick={() => setFiltro(opcion)}
                >
                  {opcion === "activos"
                    ? "Activos"
                    : opcion === "inactivos"
                      ? "Inactivos"
                      : "Todos"}
                </button>
              ))}
            </div>

            <button type="button" className="details-button" onClick={nuevo}>
              + Nuevo repuesto
            </button>

            <button
              type="button"
              className="details-button"
              disabled={cargando}
              onClick={() => void cargar()}
            >
              Actualizar listado
            </button>

            <div className="mis-sincronizacion">
              {cargando
                ? "Cargando..."
                : `${visibles.length} repuestos encontrados`}
            </div>

            <section className="mis-listado">
              {!cargando && visibles.length === 0 && (
                <p className="mis-vacio">No se encontraron repuestos.</p>
              )}

              {visibles.map((r) => (
                <article
                  key={r.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #dbe3ed",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}>
                    <div>
                      <strong>{r.nombre}</strong>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {r.codigo}
                      </div>
                    </div>
                    <span style={{
                      color: r.activo ? "#047857" : "#b91c1c",
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      {r.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <p>Stock: <strong>{r.disponible} {r.unidad}</strong></p>
                  <p>Stock mínimo: {r.minimo}</p>
                  <p>Ubicación: {r.ubicacion}</p>
                  <p>Estado de stock: {r.estado}</p>

                  <div style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}>
                    <button
                      type="button"
                      className="details-button"
                      onClick={() => editar(r)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="details-button"
                      onClick={() => void cambiarEstado(r)}
                    >
                      {r.activo ? "Desactivar" : "Reactivar"}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : (
          <form onSubmit={(e) => void guardar(e)}>
            <h2>{editando ? "Editar repuesto" : "Nuevo repuesto"}</h2>

            <div className="campo">
              <label htmlFor="codigo">Código / SKU</label>
              <input
                id="codigo"
                required
                maxLength={50}
                value={formulario.codigo}
                onChange={(e) => cambiarCampo("codigo", e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                required
                maxLength={200}
                value={formulario.nombre}
                onChange={(e) => cambiarCampo("nombre", e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="minimo">Stock mínimo</label>
              <input
                id="minimo"
                type="number"
                min={0}
                required
                value={formulario.minimo}
                onChange={(e) =>
                  cambiarCampo("minimo", Number(e.target.value))
                }
              />
            </div>

            <div className="campo">
              <label htmlFor="unidad">Unidad de medida</label>
              <input
                id="unidad"
                required
                maxLength={30}
                value={formulario.unidad}
                onChange={(e) => cambiarCampo("unidad", e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="ubicacion">Ubicación</label>
              <input
                id="ubicacion"
                maxLength={200}
                value={formulario.ubicacion}
                onChange={(e) => cambiarCampo("ubicacion", e.target.value)}
              />
            </div>

            {editando && (
              <p>
                Stock actual: <strong>{editando.disponible} {editando.unidad}</strong>.
                Para cambiarlo utilizá los movimientos de stock.
              </p>
            )}

            <button
              type="submit"
              className="details-button"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar repuesto"}
            </button>

            <button
              type="button"
              className="details-button"
              disabled={guardando}
              onClick={() => {
                setMostrarFormulario(false);
                setError("");
              }}
            >
              Cancelar
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
