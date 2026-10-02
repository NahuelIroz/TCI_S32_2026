# Levantar el proyecto con Docker

Este proyecto utiliza **React + Vite + TypeScript** y puede ejecutarse utilizando Docker.

De esta manera no es necesario instalar Node.js ni las dependencias de npm directamente en la computadora.

## Requisitos

Antes de comenzar es necesario tener instalado:

- Git
- Docker Desktop

Verificar que Docker Desktop se encuentre iniciado antes de ejecutar los comandos.

---

## 1. Clonar el repositorio

Clonar el proyecto:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Ingresar a la carpeta del proyecto:


Luego ingresar a la carpeta donde se encuentra el `Dockerfile` y el `package.json`.


## 2. Construir la imagen Docker

Desde la carpeta donde se encuentra el `Dockerfile`, ejecutar:

```bash
docker build -t farmacia-react .
```


---

## 3. Verificar que la imagen fue creada

Ejecutar:

```bash
docker images
```

Debería aparecer una imagen llamada:

```text
farmacia-react
```

---

## 4. Ejecutar el contenedor

Ejecutar:

```bash
docker run --name farmacia-app -p 5173:5173 farmacia-react
```

La aplicación quedará disponible en el puerto `5173`.

Abrir en el navegador:

```text
http://localhost:5173
```

---

## 5. Detener el contenedor

Para detenerlo desde otra terminal:

```bash
docker stop farmacia-app
```

También se puede detener presionando:

```text
Ctrl + C
```

en la terminal donde se está ejecutando.

---

## 6. Volver a ejecutar el proyecto

Si el contenedor ya fue creado anteriormente y está detenido:

```bash
docker start farmacia-app
```

Para volver a detenerlo:

```bash
docker stop farmacia-app
```

---

## Acceso a la aplicación

Una vez iniciado el contenedor, ingresar desde el navegador a:

```text
http://localhost:5173
```