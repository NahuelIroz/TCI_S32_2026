# Guía Docker — Proyecto Farmacia

Esta guía permite levantar **PostgreSQL 16, FastAPI y React/Vite** desde la raíz del repositorio con Docker Compose. Está pensada para Windows con Docker Desktop y PowerShell, aunque los comandos de Docker también sirven en otras plataformas.

## 1. Requisitos y estructura

- Docker Desktop instalado y en ejecución (en Windows, con el motor Linux/WSL2 habilitado).
- Git para clonar el repositorio.
- Puertos **5173**, **8000** y **5432** libres en la computadora.

Estructura esperada:

```text
Farmacia/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── pyproject.toml
│   ├── uv.lock
│   └── app/
└── mi-primera-spa/
    ├── Dockerfile
    ├── .dockerignore
    ├── package.json
    ├── package-lock.json
    └── src/
```

El archivo `docker-compose.yml` define los servicios `db`, `backend` y `frontend`. La configuración actual usa las imágenes `postgres:16`, `python:3.12-slim` y `node:22-alpine` como bases.

> **Configuración de demostración:** la contraseña `farmacia_dev` es solo para desarrollo. No publiques contraseñas reales, tokens ni archivos `.env` con secretos en Git.

## 2. Primera ejecución en otra computadora

1. Iniciar Docker Desktop.
2. Clonar el repositorio y abrir una terminal **en la carpeta que contiene `docker-compose.yml`**.
3. Verificar la configuración y construir/iniciar:

```powershell
docker compose config
docker compose up --build -d
docker compose ps
```

Esperar hasta ver `farmacia_db` como **healthy** y los otros dos servicios como **Up**.

Abrir:

- Frontend: http://localhost:5173
- Documentación API: http://localhost:8000/docs

Si el frontend abre pero no muestra datos, revisar primero que la API responda y que el frontend use la URL correcta (`http://localhost:8000` cuando se accede desde el navegador de esa misma computadora).

**Importante:** en una computadora nueva el volumen de PostgreSQL estará vacío. Que los contenedores se inicien **no garantiza** que existan tablas ni datos. El backend debe ejecutar la inicialización de tablas o las migraciones, y los datos de demostración deben cargarse aparte (sección 6).

## 3. Comandos habituales

| Necesidad | Comando (desde la raíz) |
|---|---|
| Iniciar contenedores existentes | `docker compose up -d` |
| Ver estado | `docker compose ps` |
| Ver logs de todos | `docker compose logs --tail=100` |
| Seguir logs del backend | `docker compose logs -f backend` |
| Seguir logs del frontend | `docker compose logs -f frontend` |
| Seguir logs de la base | `docker compose logs -f db` |
| Detener y eliminar contenedores/red (conservar datos) | `docker compose down` |
| Reiniciar un servicio | `docker compose restart backend` |
| Reconstruir todos los servicios | `docker compose up --build -d` |

Para salir de `logs -f`, presionar `Ctrl+C` (no detiene el contenedor).

## 4. ¿Qué hacer cuando modifico código?

Los Dockerfile actuales **copian el código a la imagen**, sin montar el código local como volumen. Por eso, para que los cambios aparezcan dentro de los contenedores, hay que **reconstruir** el servicio modificado.

### Si cambié React / TypeScript / CSS

```powershell
docker compose up -d --build frontend
```

Luego actualizar la página del navegador. Si persiste una versión anterior, probar recarga forzada (`Ctrl+F5`).

### Si cambié FastAPI / Python

```powershell
docker compose up -d --build backend
```

Si agregaste dependencias con `uv`, asegurate de guardar también `pyproject.toml` y `uv.lock` en el repositorio.

### Si cambié ambos

```powershell
docker compose up -d --build
```

### Si solo cambié datos en PostgreSQL

No hace falta reconstruir ninguna imagen: los datos se guardan directamente en el volumen. **Si cambiaste modelos o estructura de tablas**, eso es distinto: `SQLModel.metadata.create_all()` crea tablas faltantes, pero **no modifica automáticamente tablas existentes**. Para cambios de esquema hacen falta migraciones (por ejemplo, Alembic) o una actualización controlada de la base.

### Si descargué cambios nuevos de Git

```powershell
git pull
docker compose up -d --build
docker compose ps
```

No es necesario ejecutar `docker compose down` antes de reconstruir.

## 5. Cómo conservar los datos

En el Compose actual:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

El volumen pertenece a **la instalación local de Docker**. Los datos sobreviven a:

- `docker compose stop`
- `docker compose down`
- `docker compose up -d --build`
- Reinicios de la computadora

**NO ejecutar `docker compose down -v`** si querés conservar los datos: la opción `-v` elimina los volúmenes declarados por Compose, incluido el de PostgreSQL. Tampoco elimines el volumen desde Docker Desktop sin tener un respaldo.

## 6. Llevar los datos de demostración a otra computadora

### A. Crear un respaldo en la computadora actual

Con `farmacia_db` en ejecución, desde PowerShell:

```powershell
docker exec farmacia_db pg_dump -U farmacia -d farmacia_db -F c -f /tmp/farmacia_demo.dump
docker cp farmacia_db:/tmp/farmacia_demo.dump ./farmacia_demo.dump
docker exec farmacia_db rm /tmp/farmacia_demo.dump
```

Se creará `farmacia_demo.dump` en la carpeta actual. Contiene el esquema y los datos de la base `farmacia_db` al momento del respaldo. **Revisá que no contenga información sensible** antes de compartirlo; preferí datos ficticios para la presentación. Por defecto, no subas este archivo al repositorio público.

### B. Restaurar en la otra computadora

1. Clonar el proyecto y levantar Docker (`docker compose up --build -d`).
2. Copiar `farmacia_demo.dump` a la carpeta raíz del proyecto.
3. Ejecutar desde PowerShell:

```powershell
docker cp ./farmacia_demo.dump farmacia_db:/tmp/farmacia_demo.dump
docker exec farmacia_db pg_restore -U farmacia -d farmacia_db --clean --if-exists --no-owner --no-acl /tmp/farmacia_demo.dump
docker exec farmacia_db rm /tmp/farmacia_demo.dump
```

**Advertencia:** la restauración reemplaza objetos existentes y puede sobrescribir información de esa base. Hacela solo sobre una **base de demostración descartable**, sin datos que quieras conservar. Si el backend crea tablas al iniciar, `--clean --if-exists` ayuda a reemplazarlas; si la restauración muestra errores, revisá los logs y el esquema antes de continuar. Para una restauración completamente limpia, conviene preparar una base nueva y restaurar antes de iniciar el backend.

Al terminar, verificar la aplicación en `http://localhost:5173`.

### C. Respaldo antes de una modificación importante

Repetir el procedimiento del apartado A y guardar el `.dump` en un lugar seguro. Para una demo, preparar un respaldo final con los datos ficticios que se mostrarán.

## 7. Diagnóstico de problemas

### Contenedor que no arranca

```powershell
docker compose ps -a
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
docker compose logs --tail=100 db
```

### Puerto ocupado

Cerrar los procesos locales de Vite (`npm run dev`), FastAPI (`uv run uvicorn ...`) o PostgreSQL que usen los puertos publicados. Si no es posible, ajustar el puerto **del lado izquierdo** en `docker-compose.yml` y las URLs correspondientes.

### React abre, pero falla la API

- Verificar `http://localhost:8000/docs`.
- Revisar la configuración de la URL base de API en `mi-primera-spa` (por ejemplo `VITE_API_URL`).
- El navegador usa `localhost:8000` si todo corre en **esa misma PC**. El nombre `backend` sirve para comunicación **entre contenedores**, no como hostname del navegador.
- Verificar CORS en FastAPI si el navegador muestra errores de origen cruzado.

### Base sin tablas o sin registros

- Verificar que el backend ejecute la inicialización o migraciones de esquema.
- Restaurar el respaldo de demostración siguiendo la sección 6.
- Recordar que el volumen de tu PC **no se copia automáticamente** a otra computadora.

### Para conectar a la base desde terminal
docker exec -it farmacia_db psql -U farmacia -d farmacia_db

## 8. Lista de verificación antes de presentar

- [ ] Docker Desktop funciona en la computadora de presentación.
- [ ] El repositorio incluye ambos Dockerfile, `docker-compose.yml`, `uv.lock` y `package-lock.json`.
- [ ] `docker compose up --build -d` termina sin errores.
- [ ] Los tres contenedores figuran `Up` y PostgreSQL `healthy`.
- [ ] Swagger responde en `http://localhost:8000/docs`.
- [ ] React responde en `http://localhost:5173`.
- [ ] React consulta correctamente la API.
- [ ] Los datos ficticios de demostración están restaurados.
- [ ] Se prueban los perfiles y flujos que se mostrarán en la exposición.

---

**Nota:** esta guía corresponde al Compose y los Dockerfile preparados para el proyecto actual. Si más adelante incorporamos migraciones automáticas, variables de entorno nuevas, archivos subidos por usuarios o un frontend servido por Nginx, hay que actualizarla. Los archivos de fotos almacenados fuera de PostgreSQL requieren su propio volumen o respaldo: un `pg_dump` no los incluye.
