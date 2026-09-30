import "./styles.css"

export function Login() {
  return (
    <main className="login-container">
      <div className="login">
        <div className="login-logo">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#2bb673" />
            <rect x="42" y="20" width="16" height="60" rx="4" fill="white" />
            <rect x="20" y="42" width="60" height="16" rx="4" fill="white" />
          </svg>
        </div>

        <h1>Farmacia</h1>

        <p>Ingresá al sistema de gestión</p>

        <form>
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            placeholder="Ingresá tu usuario"
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Ingresá tu contraseña"
          />

          <button type="submit">Ingresar</button>

          <a href="#">¿Olvidaste tu contraseña?</a>
        </form>
      </div>
    </main>
  )
}