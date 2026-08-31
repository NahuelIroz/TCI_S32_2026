# TEAM CHARTER

## 1. Integrantes

| Integrante     | Email                                                   |
| -------------- | ------------------------------------------------------- |
| Nahuel Iroz    | [nahuel.t.p@hotmail.com]|
| [Integrante 2] | [email]                                                 |

---

## 2. Canal de comunicación y frecuencia de encuentro

El canal principal de comunicación del equipo será **WhatsApp**.

Se establece una frecuencia mínima de **un encuentro semanal**, que podrá realizarse de manera presencial o virtual.

En cada encuentro se deberá:

* Revisar el avance de las tareas.
* Informar dificultades o bloqueos.
* Coordinar las próximas actividades.
* Distribuir nuevas tareas cuando sea necesario.

Además, cada integrante deberá mantener una comunicación activa durante el desarrollo del proyecto e informar cualquier inconveniente que pueda afectar sus tareas.

---

## 3. Convención de commits

El equipo utilizará **Conventional Commits** para mantener un historial de cambios claro y ordenado.

Se utilizarán principalmente los siguientes tipos:

* `feat`: incorporación de una nueva funcionalidad.
* `fix`: corrección de un error.
* `docs`: modificación de documentación.
* `refactor`: modificación del código sin cambiar su funcionalidad.
* `test`: incorporación o modificación de pruebas.
* `chore`: tareas de mantenimiento o configuración.

### Ejemplos

```text
feat: agregar registro de usuarios
fix: corregir validación del login
docs: actualizar README
test: agregar pruebas para usuarios
chore: actualizar dependencias
```

Los mensajes deberán ser breves, claros y describir el cambio realizado.

---

## 4. Reglas de Pull Requests

### Ramas

No se realizarán cambios directamente sobre `main`.

Cada funcionalidad o corrección deberá desarrollarse en una rama independiente.

Se utilizará la siguiente convención:

```text
feature/nombre-funcionalidad
fix/nombre-del-error
docs/nombre-documentacion
refactor/nombre-cambio
```

### Títulos de Pull Requests

Los títulos de los Pull Requests deberán seguir la misma convención utilizada para los commits.

Ejemplos:

```text
feat: implementar registro de usuarios
fix: corregir error de autenticación
docs: actualizar documentación del proyecto
```

### Aprobación

Todo Pull Request deberá ser revisado y aprobado por **al menos un integrante diferente al autor** antes de incorporarse a `main`.

El revisor deberá verificar:

* Que el cambio cumpla con el objetivo de la tarea.
* Que el código sea comprensible.
* Que no introduzca errores evidentes.
* Que las pruebas correspondientes hayan sido realizadas.
* Que se respeten las convenciones establecidas.

### Protección de `main`

La rama `main` deberá mantenerse protegida.

No estará permitido realizar `push` directo a `main`. Los cambios deberán ingresar mediante Pull Requests aprobados.

---

## 5. Definition of Done

Un cambio se considerará **terminado** cuando cumpla como mínimo con los siguientes puntos:

* La funcionalidad solicitada fue implementada.
* El código funciona correctamente.
* Se realizaron las pruebas necesarias.
* No quedan errores conocidos relacionados con el cambio.
* El código respeta las convenciones establecidas por el equipo.
* El Pull Request fue revisado y aprobado por otro integrante.
* Los cambios fueron integrados correctamente a `main`.
* La tarea correspondiente fue actualizada como terminada.

---

## 6. Acuerdo ante falta de aportes

El trabajo de Fit Hub es responsabilidad de todos los integrantes.

Si un integrante no realiza las tareas asignadas o deja de participar:

1. Se le comunicará la situación de manera directa y se le dará la posibilidad de explicar el motivo.
2. Se acordará un nuevo plazo o una forma de recuperar el trabajo pendiente.
3. Si la falta de participación continúa, el equipo redistribuirá las tareas necesarias para evitar que el proyecto quede bloqueado.
4. La situación será registrada internamente para dejar constancia del aporte realizado por cada integrante.
5. En caso de que la falta de participación persista, el equipo podrá comunicar la situación al docente responsable del proyecto.

El objetivo de este acuerdo no es sancionar ante una dificultad puntual, sino **evitar que la falta de participación de un integrante perjudique al resto del equipo y al avance del desarrollo.

---

## 7. Compromiso del equipo

Todos los integrantes se comprometen a respetar estas reglas, mantener una comunicación activa, cumplir con las tareas asignadas y colaborar para alcanzar los objetivos definidos.

