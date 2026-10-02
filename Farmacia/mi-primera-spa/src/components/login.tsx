import "./styles.css"
import Home from "./home"
import { useState } from "react"

export function Login() {
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [login, setLogin] = useState(false) 

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (usuario === "admin" && password === "1234") {
      setError(false)
      setLogin(true)

      console.log("Login correcto")

      
    } else {
      setError(true)
    }
  }

  if(login){
    return <Home />
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

          <label htmlFor="usuario">
            Usuario
          </label>

          <input
            id="usuario"
            type="text"
            placeholder="Ingresá tu usuario"
            value={usuario}
            onChange={(e) => {
              setUsuario(e.target.value)
              setError(false)
            }}
          />

          <label htmlFor="password">
            Contraseña
          </label>

          <input
            id="password"
            type="password"
            placeholder="Ingresá tu contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
          />

          {error && (
            <p className="error">
              Usuario o contraseña incorrectos
            </p>
          )}

          <button type="submit">
            Ingresar
          </button>

          <a href="#">
            ¿Olvidaste tu contraseña?
          </a>

        </form>

      </div>
    </main>
  )
}