import "./styles.css";

interface Repuesto {
    nombre: string;
    codigo: string;
    stockActual: number;
    stockMinimo: number;
}

const repuesto: Repuesto = {
    nombre: "Rodamiento 6205",
    codigo: "REP-0047",
    stockActual: 12,
    stockMinimo: 5
};

export function EscanearRepuesto() {
    return (
        <main className="scanner-page">

            <header className="scanner-header">
                <button className="back-button">←</button>

                <h1>Escanear repuesto</h1>

                <button className="menu-button">⋮</button>
            </header>

            <section className="scanner">

                <div className="camera">

                    <img
                        src="/repuesto.jpg"
                        alt="Repuesto"
                    />

                    {/* Marco del escáner */}
                    <div className="scan-frame">
                        <span className="corner top-left"></span>
                        <span className="corner top-right"></span>
                        <span className="corner bottom-left"></span>
                        <span className="corner bottom-right"></span>
                    </div>

                    <div className="qr-code">
                        <div className="qr-pattern">
                            REP-0047
                        </div>
                    </div>

                </div>

            </section>

            <section className="repuesto-info">

                <h2>Información del repuesto</h2>

                <h3>{repuesto.nombre}</h3>

                <p>
                    Código: <strong>{repuesto.codigo}</strong>
                </p>

                <p>
                    Stock actual:
                    <span className="stock actual">
                        {repuesto.stockActual} u.
                    </span>
                </p>

                <p>
                    Stock mínimo:
                    <span className="stock minimo">
                        {repuesto.stockMinimo} u.
                    </span>
                </p>

                <button className="details-button">
                    Ver detalles
                </button>

            </section>

        </main>
    );
}