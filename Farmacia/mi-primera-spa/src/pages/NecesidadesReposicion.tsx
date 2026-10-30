import { repuestos } from "../data/repuestos";
import { pedidosCompraIniciales } from "../data/pedidosCompraData";
import "./styles.css";

interface NecesidadesReposicionProps {
  onBack?: () => void;
  onIrACompras?: () => void;
}

export default function NecesidadesReposicion({
  onBack,
  onIrACompras,
}: NecesidadesReposicionProps) {
  // Items con stock crítico o bajo
  const criticos = repuestos.filter((r) => r.disponible <= r.minimo);
  const normales = repuestos.filter((r) => r.disponible > r.minimo);

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
        <h1>Necesidades de Reposición</h1>
      </header>

      <div className="gestion-compras-body">
        <div className="subpantalla-encabezado-con-accion">
          <div>
            <span className="badge-seccion verde">Administrar · Stock & Compras</span>
            <p className="subpantalla-descripcion">
              Diagnóstico de cobertura de almacén, piezas bajo punto de pedido y pedidos de reposición pendientes.
            </p>
          </div>
          {onIrACompras && (
            <button
              type="button"
              className="btn-nueva-incidencia"
              onClick={onIrACompras}
            >
              Ir a Gestión de Compras →
            </button>
          )}
        </div>

        {/* Resumen de Alerta de Reposición */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Repuestos Críticos</span>
            <strong className="kpi-value text-red">{criticos.length}</strong>
            <span className="kpi-desc">Por debajo del stock mínimo</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Pedidos en Trámite</span>
            <strong className="kpi-value text-blue">
              {pedidosCompraIniciales.filter((p) => p.estado !== "Recibido").length}
            </strong>
            <span className="kpi-desc">Esperando entrega o cotización</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Nivel de Cobertura</span>
            <strong className="kpi-value text-amber">
              {Math.round((normales.length / repuestos.length) * 100)}%
            </strong>
            <span className="kpi-desc">Catálogo con stock seguro</span>
          </div>
        </div>

        {/* Sección de Repuestos Críticos */}
        <h2 className="seccion-subtitulo">
          ⚠️ Repuestos que requieren reposición urgente
        </h2>

        <div className="pedidos-lista">
          {criticos.map((rep) => {
            const pedidoAsociado = pedidosCompraIniciales.find(
              (p) => p.codigo === rep.codigo && p.estado !== "Recibido"
            );
            const deficit = rep.minimo - rep.disponible;
            const reposicionSugerida = Math.max(deficit * 2, 5);

            return (
              <div key={rep.id} className="pedido-card border-alerta-critica">
                <div className="pedido-header">
                  <div>
                    <span className="pedido-id">{rep.codigo}</span>
                    <span className="badge-prioridad badge-urgente">
                      {rep.disponible === 0 ? "Agotado (0 unid.)" : "Stock Crítico"}
                    </span>
                  </div>
                  <div>
                    <span className="badge-estado-pedido badge-pendiente">
                      Déficit: -{deficit > 0 ? deficit : 0} {rep.unidad}
                    </span>
                  </div>
                </div>

                <h3 className="pedido-titulo">{rep.nombre}</h3>

                <div className="pedido-detalles-grid">
                  <div>
                    <span className="detalle-rotulo">Stock en depósito:</span>
                    <span className="detalle-valor text-red">
                      {rep.disponible} {rep.unidad}
                    </span>
                  </div>
                  <div>
                    <span className="detalle-rotulo">Mínimo de seguridad:</span>
                    <span className="detalle-valor">
                      {rep.minimo} {rep.unidad}
                    </span>
                  </div>
                  <div>
                    <span className="detalle-rotulo">Ubicación física:</span>
                    <span className="detalle-valor">{rep.ubicacion}</span>
                  </div>
                  <div>
                    <span className="detalle-rotulo">Compra sugerida:</span>
                    <span className="detalle-valor text-blue">
                      +{reposicionSugerida} {rep.unidad}
                    </span>
                  </div>
                </div>

                {pedidoAsociado ? (
                  <div className="pedido-asociado-box">
                    <strong>Pedido en curso:</strong> {pedidoAsociado.id} ({pedidoAsociado.cantidad} {pedidoAsociado.unidad}) · Estado: <em>{pedidoAsociado.estado}</em>
                  </div>
                ) : (
                  <div className="pedido-asociado-alerta">
                    ⚠️ No hay orden de compra activa para este faltante crítico.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sección de Repuestos en Estado Normal */}
        <h2 className="seccion-subtitulo mt-lg">
          ✓ Repuestos con inventario dentro de norma
        </h2>
        <div className="pedidos-lista">
          {normales.map((rep) => (
            <div key={rep.id} className="pedido-card">
              <div className="pedido-header">
                <div>
                  <span className="pedido-id">{rep.codigo}</span>
                </div>
                <div>
                  <span className="badge-estado-pedido badge-aprobado">
                    ✓ Disponible ({rep.disponible} {rep.unidad})
                  </span>
                </div>
              </div>
              <h3 className="pedido-titulo">{rep.nombre}</h3>
              <p className="pedido-justificacion">
                <strong>Ubicación:</strong> {rep.ubicacion} · <strong>Mínimo:</strong> {rep.minimo} {rep.unidad}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

