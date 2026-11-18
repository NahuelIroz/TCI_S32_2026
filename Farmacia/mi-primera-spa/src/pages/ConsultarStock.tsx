
import { useEffect, useState } from "react";

import RepuestoCard from "../components/RepuestoCard";

import type {
  EstadoStock,
  Repuesto,
} from "../data/repuestos";

import {
  obtenerRepuestos,
} from "../services/repuestosService";

import "./styles.css";

// ==========================================
// PROPIEDADES
// ==========================================

interface ConsultarStockProps {
  onBack?: () => void;
  onComprar?: (repuesto: Repuesto) => void;
  onVerTrazabilidad?: (repuesto: Repuesto) => void;
}

type FiltroStock = "Todos" | EstadoStock;

// ==========================================
// COMPONENTE
// ==========================================

function ConsultarStock({
  onBack,
  onComprar,
  onVerTrazabilidad,
}: ConsultarStockProps) {

  // Datos obtenidos desde FastAPI
  const [repuestos, setRepuestos] =
    useState<Repuesto[]>([]);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] =
    useState<FiltroStock>("Todos");

  // Estados de carga
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const filtros: FiltroStock[] = [
    "Todos",
    "Disponible",
    "Stock Bajo",
    "Agotado",
  ];

  // ==========================================
  // CONSULTAR REPUESTOS DESDE FASTAPI
  // ==========================================

  useEffect(() => {
    let activo = true;

    async function cargarRepuestos() {

      try {
        setCargando(true);
        setError("");

        const datos = await obtenerRepuestos();

        if (!activo) return;

        setRepuestos(datos);

      } catch (err) {

        if (!activo) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo consultar el stock."
        );

      } finally {

        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarRepuestos();

    return () => {
      activo = false;
    };

  }, []);

  // ==========================================
  // INDICADORES DE STOCK
  // ==========================================

  const total = repuestos.length;

  const bajoMinimo = repuestos.filter(
    (r) => r.estado === "Stock Bajo"
  ).length;

  const agotados = repuestos.filter(
    (r) => r.estado === "Agotado"
  ).length;

  // ==========================================
  // BÚSQUEDA Y FILTROS
  // ==========================================

  const repuestosFiltrados = repuestos.filter(
    (repuesto) => {

      const coincideEstado =
        filtro === "Todos" ||
        repuesto.estado === filtro;

      const texto = busqueda.trim().toLowerCase();

      const coincideBusqueda =
        repuesto.codigo.toLowerCase().includes(texto) ||
        repuesto.nombre.toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    }
  );

  // ==========================================
  // COMPRAR REPUESTO
  // ==========================================

  const comprarRepuesto = (repuesto: Repuesto) => {

    if (onComprar) {
      onComprar(repuesto);
    } else {
      alert(
        `Compra de ${repuesto.nombre} pendiente de implementar`
      );
    }
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="incidencia-container consultar-stock">

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

        <h1>Consultar stock</h1>

      </header>

      <main className="incidencia-form stock-contenido">

        {/* ======================================
            BUSCADOR
        ====================================== */}

        <div className="campo">

          <label htmlFor="buscar-repuesto">
            Buscar repuesto
          </label>

          <input
            id="buscar-repuesto"
            type="search"
            placeholder="Nombre o código SKU..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
          />

        </div>

        {/* ======================================
            RESUMEN DE STOCK
        ====================================== */}

        <section className="stock-resumen">

          <div className="stock-indicador">
            <small>Total</small>
            <strong>{total}</strong>
          </div>

          <div className="stock-indicador">
            <small>Bajo mínimo</small>

            <strong className="stock-numero-bajo">
              {bajoMinimo}
            </strong>
          </div>

          <div className="stock-indicador">
            <small>Agotados</small>

            <strong className="stock-numero-agotado">
              {agotados}
            </strong>
          </div>

        </section>

        {/* ======================================
            FILTROS
        ====================================== */}

        <div
          className="mis-filtros"
          aria-label="Filtrar repuestos por disponibilidad"
        >

          {filtros.map((item) => (

            <button
              key={item}
              type="button"
              className={
                filtro === item
                  ? "filtro activo"
                  : "filtro"
              }
              aria-pressed={filtro === item}
              onClick={() => setFiltro(item)}
            >

              {item}

              {item === "Todos" && (
                <span className="filtro-cantidad">
                  {total}
                </span>
              )}

            </button>

          ))}

        </div>

        {/* ======================================
            ESTADOS DE CARGA
        ====================================== */}

        {cargando && (
          <p className="mis-vacio">
            Cargando repuestos...
          </p>
        )}

        {error && (
          <p
            role="alert"
            style={{ color: "#dc3545" }}
          >
            {error}
          </p>
        )}

        {/* ======================================
            LISTADO DE REPUESTOS
        ====================================== */}

        {!cargando && !error && (

          <section className="stock-listado">

            {repuestosFiltrados.length > 0 ? (

              repuestosFiltrados.map((repuesto) => (

                <RepuestoCard
                  key={repuesto.id}
                  repuesto={repuesto}
                  onComprar={comprarRepuesto}
                  onVerTrazabilidad={onVerTrazabilidad}
                />

              ))

            ) : (

              <p className="mis-vacio">
                No se encontraron repuestos.
              </p>

            )}

          </section>

        )}

      </main>

    </div>
  );
}

export default ConsultarStock;

