# .2 Búsquedas

## 1. ¿Qué es una SPA (Single Page Application) y en qué se diferencia de una página tradicional (MPA)?

**Qué busqué:**
`Qué es SPA Single Page Application y diferencia con MPA`

**Fuente:**
[MDN – SPA (Single-page application)](https://developer.mozilla.org/en-US/docs/Glossary/SPA)

**Qué entendí:**
Una **SPA** carga un único documento y luego utiliza JavaScript para actualizar el contenido sin tener que cargar una página completa cada vez que el usuario navega.

En una **MPA (Multi-Page Application)**, cada navegación normalmente implica cargar una nueva página desde el servidor.

---

## 2. ¿Qué es una Promise en JavaScript y para qué sirve? ¿Qué problema resuelve?

**Qué busqué:**
`JavaScript Promise qué es y para qué sirve`

**Fuente:**
[MDN – Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

**Qué entendí:**
Una **Promise** representa el resultado futuro de una operación que se ejecuta de forma asíncrona.

Sirve para manejar operaciones que pueden tardar, como una petición a un servidor, indicando si la operación terminó correctamente o si ocurrió un error. También permite evitar callbacks anidados y facilita el uso de `async/await`.

---

## 3. ¿Por qué `fetch` devuelve una promesa y no el dato directamente?

**Qué busqué:**
`JavaScript fetch por qué devuelve Promise`

**Fuente:**
[MDN – Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

**Qué entendí:**
`fetch` realiza una petición a través de la red y esta operación puede tardar. Por eso no devuelve el dato directamente, sino una **Promise** que representa la respuesta futura.

Mientras se espera la respuesta, JavaScript puede continuar ejecutando otras tareas. Cuando llega la respuesta podemos trabajar con ella utilizando `.then()` o `await`.

---

## 4. ¿Qué diferencia hay entre `XMLHttpRequest` (lo viejo) y `fetch` (lo actual)?

**Qué busqué:**
`diferencia XMLHttpRequest y Fetch JavaScript`

**Fuente:**
[MDN – XMLHttpRequest API](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API)

**Qué entendí:**
`XMLHttpRequest` es una API más antigua utilizada para realizar peticiones HTTP y manejar sus respuestas principalmente mediante eventos y callbacks.

`fetch` es una API más moderna que utiliza **Promises**, lo que facilita el manejo de operaciones asíncronas y permite utilizar `.then()`, `.catch()` y `async/await`.

---

## Resumen

| Concepto           | Qué entendí                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **SPA**            | Una aplicación que carga una página y actualiza su contenido dinámicamente mediante JavaScript. |
| **MPA**            | Una aplicación donde la navegación normalmente carga nuevas páginas.                            |
| **Promise**        | Representa el resultado futuro de una operación asíncrona.                                      |
| **fetch**          | Realiza peticiones de red de forma asíncrona y devuelve una Promise.                            |
| **XMLHttpRequest** | API anterior para realizar peticiones HTTP, basada principalmente en eventos y callbacks.       |
| **fetch**          | API moderna basada en Promises, que facilita el manejo con `.then()` y `async/await`.           |



# 3.5 Preguntas guía

## 1. ¿Qué significa que `fetch` sea asincrónico? ¿Qué pasaría con la página si no lo fuera?

Que `fetch` sea **asincrónico** significa que la petición a un servidor se realiza sin detener la ejecución del resto del código de JavaScript. La página puede seguir funcionando mientras espera que llegue la respuesta.

Si `fetch` no fuera asincrónico, la página tendría que quedarse esperando la respuesta del servidor antes de continuar. Esto podría hacer que la interfaz se congele durante la petición, especialmente si la respuesta tarda mucho en llegar.

---

## 2. ¿Por qué `respuesta.json()` también devuelve una promesa?

`respuesta.json()` devuelve una **Promise** porque convertir el cuerpo de la respuesta en un objeto JavaScript también es una operación que puede llevar tiempo.

Por eso no obtenemos directamente el objeto, sino una promesa que se resuelve cuando los datos fueron procesados. Podemos obtener el resultado utilizando `await` o `.then()`.

Por ejemplo:

```javascript
const respuesta = await fetch(url);
const datos = await respuesta.json();
```

En este caso, primero esperamos la respuesta del servidor y después esperamos a que el contenido de esa respuesta sea convertido a JSON.

---

## 3. ¿Qué relación hay entre una SPA y `fetch`? ¿Por qué la SPA "necesita" pedir datos así?

Una **SPA (Single Page Application)** intenta actualizar el contenido de la página sin tener que recargarla completamente cada vez que el usuario realiza una acción.

`fetch` permite que la SPA se comunique con un servidor y obtenga los datos necesarios **sin recargar toda la página**. Por ejemplo, una SPA puede pedir una lista de usuarios, productos o publicaciones y después mostrar esos datos actualizando solamente una parte de la interfaz.

Por eso `fetch` es muy útil en una SPA: permite solicitar datos al servidor de forma asincrónica y actualizar la interfaz cuando esos datos están disponibles.


# 4.2 Búsquedas

## 1. ¿Qué es un componente en React? ¿Por qué conviene dividir la UI en componentes?

**Qué busqué:**
`React qué es un componente y por qué usar componentes`

**Fuente:**
[React – Your First Component](https://react.dev/learn/your-first-component)

**Qué entendí:**
Un **componente** en React es una parte reutilizable de la interfaz que puede tener su propia lógica y representación visual.

Conviene dividir la UI en componentes porque permite organizar mejor el código, reutilizar partes de la interfaz y hacer que cada componente tenga una responsabilidad más específica. Esto facilita también el mantenimiento y las modificaciones de la aplicación.

---

## 2. ¿Qué es JSX? ¿Por qué se parece a HTML pero no es HTML?

**Qué busqué:**
`React JSX qué es diferencia HTML`

**Fuente:**
[React – Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx)

**Qué entendí:**
**JSX** es una extensión de sintaxis utilizada habitualmente con React que permite escribir una estructura parecida a HTML dentro de JavaScript.

Se parece a HTML porque utiliza etiquetas como `<div>`, `<h1>` o `<button>`, pero **no es HTML**. JSX es transformado por las herramientas de desarrollo en código JavaScript que React puede utilizar para construir la interfaz.

---

## 3. ¿Qué es el estado (`useState`)? ¿En qué se diferencia de una variable común?

**Qué busqué:**
`React useState estado diferencia variable común`

**Fuente:**
[React – State: A Component's Memory](https://react.dev/learn/state-a-components-memory)

**Qué entendí:**
El **estado** es información que un componente necesita recordar entre sus diferentes renderizados. `useState` permite crear ese estado y una función para modificarlo.

La diferencia con una variable común es que cuando cambia una variable normal, React no necesariamente vuelve a renderizar el componente. En cambio, cuando se actualiza un estado mediante su función correspondiente, React sabe que debe actualizar la interfaz.

Ejemplo:

```tsx
const [contador, setContador] = useState(0);
```

`contador` contiene el valor actual y `setContador` permite modificarlo y provocar una nueva renderización.

---

## 4. ¿Qué son las props? ¿En qué se diferencian del estado?

**Qué busqué:**
`React props diferencia state`

**Fuente:**
[React – Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)

**Qué entendí:**
Las **props** son datos que un componente recibe desde otro componente, normalmente desde su componente padre. Permiten enviar información y configurar cómo se comporta o se muestra un componente.

La principal diferencia es que las **props son recibidas desde afuera**, mientras que el **estado pertenece al propio componente** y puede cambiar durante su funcionamiento.

Por ejemplo:

```tsx
function Saludo({ nombre }) {
  return <h1>Hola {nombre}</h1>;
}
```

En este caso, `nombre` es una prop que el componente recibe.

---

## 5. ¿Por qué usar TypeScript en el frontend? ¿Qué problema te resuelve antes de que el código corra?

**Qué busqué:**
`TypeScript frontend beneficios detectar errores antes de ejecutar código`

**Fuente:**
[TypeScript – Why TypeScript](https://www.typescriptlang.org/why-create-typescript/)

**Qué entendí:**
**TypeScript** agrega un sistema de tipos a JavaScript. Esto permite detectar determinados errores mientras estamos escribiendo o compilando el código, antes de que la aplicación llegue a ejecutarse.

Por ejemplo, si una función espera recibir un `string` pero le pasamos un `number`, TypeScript puede marcar el problema antes de ejecutar la aplicación.

Esto ayuda a encontrar errores relacionados con los tipos de datos y hace que el código sea más fácil de mantener y entender, especialmente en proyectos grandes.

---


# Preguntas guía

## 1. ¿Qué relación ves entre el patrón "separar datos de la vista" que usaste en el taller de incidencia y el estado de React?

La relación es que ambos permiten **separar la información de la forma en que se muestra**.

En el taller de incidencias, los datos de una incidencia estaban separados de la estructura visual que los mostraba. En React, el **estado** permite guardar esos datos dentro del componente y utilizarlos para generar la vista.

Cuando el estado cambia, React vuelve a renderizar el componente y muestra los datos actualizados. Esto permite que la interfaz se mantenga sincronizada con la información.

---

## 2. ¿Por qué el `interface IncidenciaProps` evita errores? ¿Dónde "vive" esa verificación: en el navegador o en el editor?

El `interface IncidenciaProps` define qué propiedades debe recibir el componente y qué tipo de dato tiene cada una.

Por ejemplo:

```tsx
interface IncidenciaProps {
  titulo: string;
  prioridad: number;
}
```

Si intentamos utilizar el componente pasando un dato incorrecto, **TypeScript puede detectar el error antes de ejecutar el programa**.

Esta verificación ocurre principalmente durante el desarrollo, en el **editor y en el proceso de compilación/type-checking de TypeScript**, no en el navegador. Los tipos de TypeScript no se ejecutan en el navegador porque se eliminan al transformar el código a JavaScript.

---

## 3. ¿Qué hace Vite que antes hacías a mano (o con un `script` de `<head>`)?

Vite se encarga de varias tareas que anteriormente podían requerir configuración manual.

Por ejemplo, se ocupa de preparar y servir el proyecto durante el desarrollo, procesar los archivos de JavaScript/TypeScript y JSX, actualizar automáticamente la página cuando modificamos el código mediante **HMR (Hot Module Replacement)** y preparar la aplicación para producción.

Antes era necesario incluir scripts y configurar herramientas manualmente para poder utilizar determinadas tecnologías. Con Vite, gran parte de esa configuración ya viene preparada y podemos iniciar el proyecto con comandos como:

```bash
npm run dev
```

Esto permite trabajar con React de una manera más rápida y organizada.

