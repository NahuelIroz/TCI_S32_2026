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
