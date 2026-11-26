import { useState, useEffect } from "react";
import {
  obtenerEstadisticasHistoricos,
  type EstadisticasHistoricosRead,
} from "../services/estadisticasService";
import "./styles.css";

interface EstadisticasHistoricosProps {
  onBack?: () => void;
}

export default function EstadisticasHistoricos({
  onBack,
}: EstadisticasHistoricosProps) {
  const [datos, setDatos] = useState<EstadisticasHistoricosRead | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    async function cargar() {
      try {
        setCargando(true);
        setError(null);
        const res = await obtenerEstadisticasHistoricos();
        if (montado) {
          setDatos(res);
        }
      } catch (err) {
        if (montado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las estadísticas e históricos"
          );
        }
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    }

    void cargar();

    return () => {
      montado = false;
    };
  }, []);

  const metricas = datos?.metricas ?? {
    mtbf_horas: 0,
    mttr_horas: 0,
    tasa_averias_porcentaje: 0,
    disponibilidad_planta: 0,
  };
  const meses = datos?.tendencia_semestral ?? [];
  const rankingRepuestos = datos?.ranking_repuestos ?? [];
  const costosPorSector = datos?.costos_por_sector ?? [];

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
        <h1>Estadísticas e Históricos</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado">
          <p className="subpantalla-descripcion">
            Evolución semestral de paradas no programadas, métricas MTBF/MTTR, consumo de insumos y costos acumulados.
          </p>
        </div>

        {error && (
          <div className="alerta-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        {cargando ? (
          <p className="no-items-msg">Calculando indicadores históricos...</p>
        ) : (
          <>
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-label">MTBF (Tiempo Medio Entre Fallas)</span>
                <strong className="kpi-value text-blue">
                  {metricas.mtbf_horas} h
                </strong>
                <span className="kpi-desc">Confiabilidad operativa</span>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">MTTR (Tiempo Medio de Reparación)</span>
                <strong className="kpi-value text-amber">
                  {metricas.mttr_horas} h
                </strong>
                <span className="kpi-desc">Velocidad de respuesta</span>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">Tasa de Averías</span>
                <strong className="kpi-value text-red">
                  {metricas.tasa_averias_porcentaje}%
                </strong>
                <span className="kpi-desc">Incidencia sobre horas op.</span>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">OEE Promedio Planta</span>
                <strong className="kpi-value text-green">
                  {metricas.disponibilidad_planta}%
                </strong>
                <span className="kpi-desc">Eficiencia global</span>
              </div>
            </div>

            <div className="tablero-bloque">
              <div className="tablero-bloque-header">
                <h3>Tendencia Semestral de Incidencias</h3>
              </div>
              <div className="maquinas-resumen-grid">
                {meses.map((m) => (
                  <div key={m.mes} className="resumen-chip chip-mantenimiento">
                    <strong>{m.mes}:</strong> {m.fallas} fallas ({m.horas_parada}h parada)
                  </div>
                ))}
              </div>
            </div>

            <div className="tablero-bloque">
              <h3>Ranking de Repuestos más Utilizados</h3>
              <p className="tablero-subtexto">
                Piezas de recambio con mayor frecuencia de reposición en planta:
              </p>

              <div className="pedidos-lista">
                {rankingRepuestos.map((item, idx) => (
                  <div key={item.sku} className="pedido-card">
                    <div className="pedido-header">
                      <div>
                        <span className="pedido-id">#{idx + 1}</span>
                        <span className="pedido-sku">{item.sku}</span>
                      </div>
                      <span className="badge-estado-pedido badge-cotizacion">
                        {item.usos} reemplazos registrados
                      </span>
                    </div>
                    <h3 className="pedido-titulo">{item.nombre}</h3>
                    <div className="pedido-meta-gerencia">
                      <span>
                        <strong>Inversión acumulada:</strong> $
                        {item.costo_acumulado.toLocaleString("es-AR")}
                      </span>
                      <span>
                        <strong>Consumo promedio:</strong>{" "}
                        {item.consumo_promedio_mensual} unid./mes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tablero-bloque">
              <h3>Distribución de Costos por Sector</h3>
              <div className="maquinas-resumen-grid">
                {costosPorSector.map((c) => (
                  <div key={c.sector} className="resumen-chip chip-alerta">
                    <strong>{c.sector}:</strong> ${c.monto.toLocaleString("es-AR")} ({c.porcentaje}%)
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
