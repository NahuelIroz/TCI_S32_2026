import "./styles.css";

interface EstadisticasHistoricosProps {
  onBack?: () => void;
}

export default function EstadisticasHistoricos({
  onBack,
}: EstadisticasHistoricosProps) {
  const meses = [
    { mes: "Mayo", fallas: 12, horasParada: 18 },
    { mes: "Junio", fallas: 9, horasParada: 14 },
    { mes: "Julio", fallas: 15, horasParada: 22 },
    { mes: "Agosto", fallas: 8, horasParada: 11 },
    { mes: "Septiembre", fallas: 6, horasParada: 9 },
    { mes: "Octubre", fallas: 4, horasParada: 5 },
  ];

  const rankingRepuestos = [
    {
      nombre: "Rodamiento Rígido de Bolas SKF 6204-2RSH",
      sku: "SKU-6204-2R",
      usos: 34,
      costoAcumulado: "$204.000",
    },
    {
      nombre: "Válvula Solenoide Festo 24V DC 5/2",
      sku: "SKU-VLV-420",
      usos: 18,
      costoAcumulado: "$333.000",
    },
    {
      nombre: "Filtro de Aire Compresor Atlas Copco",
      sku: "SKU-FLT-880",
      usos: 12,
      costoAcumulado: "$144.000",
    },
    {
      nombre: "Correa Dentada Sincrónica 8M",
      sku: "SKU-COR-900",
      usos: 8,
      costoAcumulado: "$72.000",
    },
  ];

  const costosPorSector = [
    { sector: "Línea de Envasado", porcentaje: 42, monto: "$316.000" },
    { sector: "Prensas y Formado", porcentaje: 28, monto: "$210.000" },
    { sector: "Servicios Centrales", porcentaje: 18, monto: "$135.000" },
    { sector: "Empaque Secundario", porcentaje: 12, monto: "$92.000" },
  ];

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
          <span className="badge-seccion gris">Gerencia · Analítica Histórica</span>
          <p className="subpantalla-descripcion">
            Evolución semestral de paradas no programadas, consumo de insumos y costos acumulados.
          </p>
        </div>

        {/* Gráfico Semestral de Reducción de Fallas */}
        <div className="tablero-bloque">
          <div className="tablero-bloque-header">
            <h3>Tendencia Semestral de Incidencias y Horas de Parada</h3>
            <span className="badge-seccion verde">-66% de fallas desde Mayo</span>
          </div>
          <p className="tablero-subtexto">
            Evolución de fallas mecánicas/eléctricas y tiempo total fuera de servicio (horas):
          </p>

          <div className="historico-barras-grid">
            {meses.map((m) => (
              <div key={m.mes} className="barra-columna">
                <div className="barra-grafico-wrapper">
                  <div
                    className="barra-grafico-fill barra-azul"
                    style={{ height: `${m.fallas * 6}px` }}
                    title={`${m.fallas} fallas reportadas`}
                  >
                    <span className="barra-valor-label">{m.fallas}</span>
                  </div>
                </div>
                <span className="barra-mes-label">{m.mes}</span>
                <span className="barra-horas-sub">{m.horasParada}h parada</span>
              </div>
            ))}
          </div>
        </div>

        {/* Repuestos más consumidos */}
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
                    <strong>Inversión acumulada:</strong> {item.costoAcumulado}
                  </span>
                  <span>
                    <strong>Consumo promedio:</strong>{" "}
                    {(item.usos / 6).toFixed(1)} unid./mes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desglose de Gastos por Sector */}
        <div className="tablero-bloque">
          <h3>Distribución del Presupuesto por Sector de Planta</h3>
          <div className="sectores-gasto-lista">
            {costosPorSector.map((sec) => (
              <div key={sec.sector} className="sector-gasto-item">
                <div className="sector-gasto-info">
                  <strong>{sec.sector}</strong>
                  <span>
                    {sec.monto} ({sec.porcentaje}%)
                  </span>
                </div>
                <div className="barra-progreso-track">
                  <div
                    className="barra-progreso-fill fill-medio"
                    style={{ width: `${sec.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

