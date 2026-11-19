import "./styles.css";
import Home from "./home";
import { useState } from "react";
import { PERFILES, type PerfilUsuario } from "../auth/permisos";
import { apiPost } from "../services/api";

export function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [errorMensaje, setErrorMensaje] = useState("");
  const [perfilActivo, setPerfilActivo] = useState<PerfilUsuario | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const u = usuario.trim().toLowerCase();
    const p = password.trim();

    if (!u || !p) {
      setErrorMensaje("Por favor, ingresá usuario y contraseña.");
      return;
    }

    try {
      setErrorMensaje("");

      // Petición real al backend FastAPI
      const respuesta = await apiPost<{
        access_token: string;
        token_type: string;
        usuario: {
          id: number;
          username: string;
          nombre: string;
          rol: "OPERARIO" | "MANTENIMIENTO" | "ENCARGADO" | "GERENCIA";
        };
      }, { username: string; password: string }>(
        "/api/v1/auth/login",
        { username: u, password: p }
      );

      // 1. Guardar el token JWT en localStorage
      localStorage.setItem("token", respuesta.access_token);

      // 2. Cargar el perfil correspondiente según el rol del backend
      const rolKey = respuesta.usuario.rol.toLowerCase() as keyof typeof PERFILES;
      if (PERFILES[rolKey]) {
        setPerfilActivo(PERFILES[rolKey]);
      } else {
        setPerfilActivo(PERFILES.operario);
      }
    } catch (err) {
      setErrorMensaje(
        err instanceof Error ? err.message : "Usuario o contraseña inválidos."
      );
    }
  };

  if (perfilActivo) {
    return (
      <Home
        usuario={perfilActivo}
        onCerrarSesion={() => {
          localStorage.removeItem("token");
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