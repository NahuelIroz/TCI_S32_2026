# Suite de Tests Unitarios - Backend Farmacia

Este directorio contiene las pruebas unitarias automatizadas para la capa de servicios, lógica de negocio, validaciones de esquemas y control de acceso basado en roles (RBAC) del backend.

---

## 📋 Requisitos Previos

* Python 3.12 o superior.
* Entorno virtual de Python configurado en `backend/.venv` con las dependencias instaladas.

---

## 🚀 Cómo Ejecutar los Tests Unitarios

Los tests están construidos utilizando la biblioteca estándar `unittest` de Python, por lo que **no requieren dependencias externas adicionales** para su ejecución.

### Opción 1: Ejecución directa con el entorno virtual (Recomendado)

Desde la raíz del proyecto (`Farmacia`):

```bash
cd backend
.venv/bin/python -m unittest discover tests -v
```

O si ya tenés activado el entorno virtual (`source .venv/bin/activate`):

```bash
cd backend
python -m unittest discover tests -v
```

---

### Opción 2: Ejecutar un archivo específico de pruebas

Para correr únicamente la suite del Tablero de Gerencia:

```bash
cd backend
.venv/bin/python -m unittest tests/test_tablero_gerencia.py -v
```

Para correr un test individual (ejemplo, verificación de roles):

```bash
cd backend
.venv/bin/python -m unittest tests.test_tablero_gerencia.TestTableroGerencia.test_02_permisos_gerencia_acceso_permitido -v
```

---

### Opción 3: Ejecución con Pytest (si instalaste las dependencias dev)

```bash
cd backend
pytest -v
```

---

### Opción 4: Ejecución dentro del contenedor Docker

Si tenés la aplicación corriendo con Docker Compose:

```bash
docker compose exec backend python -m unittest discover tests -v
```

---

## 🧪 Cobertura de la Suite `test_tablero_gerencia.py`

Esta batería de **20 tests unitarios** valida de forma exhaustiva el módulo de Gerencia y Tablero Ejecutivo:

| Categoría | Tests | Descripción |
|---|---|---|
| **Seguridad y Roles** | `test_01` al `test_05` | Valida que el rol `GERENCIA` exista, que tenga acceso autorizado a los endpoints y que roles no autorizados (`OPERARIO`, `MANTENIMIENTO`, `ENCARGADO`) sean bloqueados con `HTTP 403 Forbidden`. |
| **Disponibilidad de Máquinas** | `test_06` al `test_11` | Valida el conteo por condición operativa (`OPERATIVA`, `ALERTA`, `MANTENIMIENTO`, `DETENIDA`), total de flota y caso de borde de flota vacía (evita división por cero). |
| **Métricas y Normalización** | `test_12` al `test_14` | Valida el cálculo del OEE promedio ponderado con redondeo a 1 decimal, manejo de valores nulos y normalización de textos (mayúsculas/minúsculas y espacios). |
| **Fallas e Incidencias en Planta** | `test_15` al `test_18` | Valida el mapeo completo al DTO (máquina, turno, técnico y prioridad), manejo de incidencias huérfanas o sin técnico, y consistencia del totalizador de fallas activas. |
| **Esquemas DTO y Serialización** | `test_19` y `test_20` | Valida la estructura estricta de `TableroResumen`, `ResumenMaquinas`, `IncidenciaTablero` y su serialización a JSON para la respuesta HTTP de FastAPI. |

---

## 💡 Salida Esperada

Al ejecutar la suite completa, todos los tests deben pasar en verde:

```text
Ran 20 tests in 0.062s

OK
```
