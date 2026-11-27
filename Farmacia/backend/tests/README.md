# Suite de Tests Unitarios - Backend Farmacia

Este directorio contiene los **20 tests unitarios** automatizados para el perfil **Gerencia** y el **Tablero de Seguimiento Ejecutivo**.

---

##  Requisitos Previos

* Python 3.12 o superior.
* `uv` instalado y entorno virtual configurado en `backend/.venv`.

---

##  Cómo Ejecutar los Tests Unitarios

### Ejecución con `uv run pytest` (Recomendado)

```bash
cd backend
uv run pytest
```

Para ver el detalle de cada test individual:

```bash
cd backend
uv run pytest -v
```

*(Si no tenés conexión a internet al momento de correrlos: `uv run --no-sync pytest -v`)*.

---

##  Cobertura de la Suite (`test_tablero_gerencia.py` — 20 tests)

| Categoría | Tests | Descripción |
|---|---|---|
| **Seguridad y Roles** | `test_01` al `test_05` | Valida que el rol `GERENCIA` exista, que tenga acceso autorizado y que roles no autorizados (`OPERARIO`, `MANTENIMIENTO`, `ENCARGADO`) reciban `HTTP 403 Forbidden`. |
| **Disponibilidad de Máquinas** | `test_06` al `test_11` | Valida el conteo por estado operativo (`OPERATIVA`, `ALERTA`, `MANTENIMIENTO`, `DETENIDA`), total de flota y caso de borde sin máquinas (evita división por cero). |
| **Métricas y Normalización** | `test_12` al `test_14` | Valida el cálculo del OEE promedio con redondeo a 1 decimal, manejo de valores nulos y normalización de textos (mayúsculas/minúsculas y espacios). |
| **Fallas e Incidencias en Planta** | `test_15` al `test_18` | Valida el mapeo completo al DTO (máquina, turno, técnico y prioridad), manejo de incidencias sin máquina o sin técnico, y consistencia del contador de fallas activas. |
| **Esquemas DTO y Serialización** | `test_19` y `test_20` | Valida la estructura de `TableroResumen`, `ResumenMaquinas`, `IncidenciaTablero` y su serialización a JSON para la respuesta HTTP de FastAPI. |
