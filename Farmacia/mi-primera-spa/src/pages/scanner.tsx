import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { repuestos, type Repuesto } from "../data/repuestos";
import "./scannerQR.css";

interface EscanearQRProps {
  onBack?: () => void;
}

export default function EscanearQR({ onBack }: EscanearQRProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [escaneando, setEscaneando] = useState(false);
  const [resultado, setResultado] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!escaneando) return;

    let cancelado = false;
    let scanner: Html5Qrcode | null = null;
    let iniciando = false;

    async function iniciarEscaner() {
      try {
        scanner = new Html5Qrcode("lector-qr");
        scannerRef.current = scanner;
        iniciando = true;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          async (textoLeido) => {
            if (cancelado) return;

            // Primero detenemos el escáner mientras el DOM está presente
            try {
              if (scanner?.isScanning) {
                await scanner.stop();
              }
            } catch (e) {
              console.error("Error al detener el escáner:", e);
            }

            setResultado(textoLeido);
            setError("");
            setEscaneando(false);
          },
          () => {
            // Se ejecuta mientras busca un código.
          }
        );

        iniciando = false;

        if (cancelado && scanner.isScanning) {
          await scanner.stop();
        }
      } catch (e) {
        console.error("Error al iniciar el escáner:", e);
        iniciando = false;
        if (!cancelado) {
          setError(
            "No se pudo acceder a la cámara. Revisá los permisos del navegador o probá con los botones de prueba."
          );
          setEscaneando(false);
        }
      }
    }

    iniciarEscaner();

    return () => {
      cancelado = true;

      const detener = async () => {
        if (!scanner) return;

        try {
          if (scanner.isScanning) {
            await scanner.stop();
          } else if (!iniciando) {
            scanner.clear();
          }
        } catch (e) {
          console.error("Error al limpiar el escáner:", e);
        }

        if (scannerRef.current === scanner) {
          scannerRef.current = null;
        }
      };

      void detener();
    };
  }, [escaneando]);

  function limpiarResultado() {
    setResultado("");
    setError("");
  }

  // Buscar si el código leído coincide con algún repuesto existente en el catálogo
  const repuestoEncontrado: Repuesto | undefined = resultado
    ? repuestos.find(
        (r) =>
          r.codigo.toLowerCase() === resultado.trim().toLowerCase() ||
          resultado.toLowerCase().includes(r.codigo.toLowerCase())
      )
    : undefined;

  return (
    <div className="pagina-qr-wrapper">
      {/* BARRA SUPERIOR CON BOTÓN VOLVER */}
      <header className="qr-topbar">
        {onBack && (
          <button
            type="button"
            className="qr-boton-volver"
            onClick={onBack}
            aria-label="Volver al panel"
          >
            ← Volver
          </button>
        )}
        <span className="qr-topbar-titulo">Mantenimiento · Lector QR</span>
      </header>

      <main className="pagina-qr">
        <section className="qr-encabezado">
          <h1>Escanear código QR</h1>
          <p>
            Escaneá el código de un repuesto para identificarlo en el sistema y
            conocer su disponibilidad.
          </p>
        </section>

        <section className="qr-tarjeta">
          <div className="qr-icono">
            <span>▦</span>
          </div>

          <h2>Escáner de repuestos</h2>
          <p className="qr-instruccion">
            Ubicá el código QR dentro del recuadro de la cámara.
          </p>

          <div className={`qr-visor ${escaneando ? "activo" : ""}`}>
            {escaneando ? (
              <>
                <div id="lector-qr" />
                <div className="qr-laser" />
                <span className="qr-corner qr-corner-tl" />
                <span className="qr-corner qr-corner-tr" />
                <span className="qr-corner qr-corner-bl" />
                <span className="qr-corner qr-corner-br" />
              </>
            ) : (
              <div className="qr-placeholder">
                <span className="qr-placeholder-icon">▦</span>
                <p>La cámara aparecerá acá</p>
                <small>Presioná "Activar cámara" para comenzar</small>
              </div>
            )}
          </div>

          <div className="qr-controles">
            {!escaneando && (
              <button
                type="button"
                className="qr-boton qr-boton-principal"
                onClick={() => {
                  limpiarResultado();
                  setEscaneando(true);
                }}
              >
                <span className="qr-btn-icon"></span> Activar cámara
              </button>
            )}

            {escaneando && (
              <button
                type="button"
                className="qr-boton qr-boton-secundario"
                onClick={() => setEscaneando(false)}
              >
                ✕ Cancelar escaneo
              </button>
            )}
          </div>

          {error && (
            <div className="qr-error" role="alert">
              <span className="qr-error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {!escaneando && !resultado && (
            <div className="qr-simulador">
              <span className="qr-simulador-titulo">
                ¿Sin cámara web disponible? Probá un código de ejemplo:
              </span>
              <div className="qr-simulador-chips">
                {repuestos.slice(0, 3).map((rep) => (
                  <button
                    key={rep.id}
                    type="button"
                    className="qr-chip"
                    onClick={() => {
                      setError("");
                      setResultado(rep.codigo);
                    }}
                  >
                    {rep.codigo}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RESULTADO DEL ESCANEO */}
          {resultado && (
            <div className="qr-resultado" aria-live="polite">
              <div className="qr-resultado-header">
                <span className="qr-check-icon">✓</span>
                <h3>¡Código detectado con éxito!</h3>
              </div>

              {repuestoEncontrado ? (
                <div className="qr-repuesto-card">
                  <div className="qr-repuesto-top">
                    <span
                      className={`qr-estado-badge ${repuestoEncontrado.estado
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {repuestoEncontrado.estado}
                    </span>
                    <span className="qr-repuesto-sku">
                      {repuestoEncontrado.codigo}
                    </span>
                  </div>

                  <h4 className="qr-repuesto-nombre">
                    {repuestoEncontrado.nombre}
                  </h4>

                  <div className="qr-repuesto-grid">
                    <div className="qr-repuesto-item">
                      <span className="qr-item-label">Stock disponible</span>
                      <strong className="qr-item-valor valor-stock">
                        {repuestoEncontrado.disponible}{" "}
                        {repuestoEncontrado.unidad}
                      </strong>
                    </div>
                    <div className="qr-repuesto-item">
                      <span className="qr-item-label">Stock mínimo</span>
                      <strong className="qr-item-valor">
                        {repuestoEncontrado.minimo}{" "}
                        {repuestoEncontrado.unidad}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="qr-raw-card">
                  <p className="qr-raw-titulo">Contenido del QR:</p>
                  <code className="qr-codigo-texto">{resultado}</code>
                  <p className="qr-raw-nota">
                    No se encontró un repuesto en el catálogo con este código.
                  </p>
                </div>
              )}

              <button
                type="button"
                className="qr-boton qr-boton-principal qr-boton-nuevo"
                onClick={limpiarResultado}
              >
                Escanear otro código
              </button>
            </div>
          )}
        </section>

        <p className="qr-pie">
          Sistema de gestión de farmacia · Lectura de códigos QR
        </p>
      </main>
    </div>
  );
}
