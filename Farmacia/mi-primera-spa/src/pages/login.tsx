import "./styles.css";
import Home from "./home";
import { useState } from "react";
import { PERFILES, type PerfilUsuario } from "../auth/permisos";

export function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [errorMensaje, setErrorMensaje] = useState("");
  const [perfilActivo, setPerfilActivo] = useState<PerfilUsuario | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const u = usuario.trim().toLowerCase();
    const p = password.trim();

    if (!u && !p) {
      setErrorMensaje("Por favor, ingresá usuario y contraseña.");
      return;
    }

    if (!u) {
      setErrorMensaje("Por favor, ingresá tu usuario.");
      return;
    }

    if (!p) {
      setErrorMensaje("Por favor, ingresá tu contraseña.");
      return;
    }

    if (p !== "1234") {
      setErrorMensaje("Contraseña incorrecta. (Prueba con '1234')");
      return;
    }

    if (u === "operario") {
      setErrorMensaje("");
      setPerfilActivo(PERFILES.operario);
      return;
    }

    if (u === "mantenimiento") {
      setErrorMensaje("");
      setPerfilActivo(PERFILES.mantenimiento);
      return;
    }

    if (u === "encargado" || u === "admin") {
      setErrorMensaje("");
      setPerfilActivo(PERFILES.encargado);
      return;
    }

    if (u === "gerencia") {
      setErrorMensaje("");
      setPerfilActivo(PERFILES.gerencia);
      return;
    }

    setErrorMensaje(
      "Usuario no válido. Usuarios habilitados: 'operario', 'mantenimiento', 'encargado' o 'gerencia'."
    );
  };

  if (perfilActivo) {
    return (
      <Home
        usuario={perfilActivo}
        onCerrarSesion={() => {
          setPerfilActivo(null);
          setUsuario("");
          setPassword("");
          setErrorMensaje("");
        }}
      />
    );
  }

  return (
    <main className="login-container">
      <div className="login">
        <div className="login-logo">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#2bb673" />
            <rect
              x="42"
              y="20"
              width="16"
              height="60"
              rx="4"
              fill="white"
            />
            <rect
              x="20"
              y="42"
              width="60"
              height="16"
              rx="4"
              fill="white"
            />
          </svg>
        </div>

        <h1>Farmacia</h1>
        <p>Ingresá al sistema de gestión</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            placeholder="operario, mantenimiento, encargado o gerencia"
            value={usuario}
            onChange={(e) => {
              setUsuario(e.target.value);
              setErrorMensaje("");
            }}
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Ingresá tu contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMensaje("");
            }}
          />

          {errorMensaje && (
            <p className="login-error-message" role="alert">
              {errorMensaje}
            </p>
          )}

          <button type="submit">Iniciar Sesión</button>
        </form>

        <div className="login-hint">
          <small>
            Contraseña de demostración: <strong>1234</strong>
          </small>
        </div>
      </div>
    </main>
  );
}
