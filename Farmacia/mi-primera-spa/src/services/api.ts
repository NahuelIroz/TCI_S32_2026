const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Helper para adjuntar el token JWT si el usuario inició sesión
function obtenerHeadersAuth(): HeadersInit {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: obtenerHeadersAuth(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
    }
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.detail && typeof error.detail === "string"
        ? error.detail
        : `Error HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export async function apiPost<TRespuesta, TDatos>(
  endpoint: string,
  datos: TDatos
): Promise<TRespuesta> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: obtenerHeadersAuth(),
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    // Si da 401 en endpoints protegidos (no en el login), limpia el token vencido
    if (response.status === 401 && endpoint !== "/api/v1/auth/login") {
      localStorage.removeItem("token");
    }
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail && typeof error.detail === "string"
        ? error.detail
        : `Error HTTP ${response.status}`
    );
  }

  return response.json() as Promise<TRespuesta>;
}