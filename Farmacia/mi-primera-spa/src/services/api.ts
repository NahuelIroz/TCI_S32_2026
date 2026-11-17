
const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status}: ${response.statusText}`
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail && typeof error.detail === "string"
        ? error.detail
        : `Error HTTP ${response.status}`
    );
  }

  return response.json() as Promise<TRespuesta>;
}
