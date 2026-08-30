## 1. Modelo de ramas

El proyecto utiliza el modelo **Feature Branch Flow**, siguiendo la convención establecida por el TCI.

La regla principal es:

> **Una feature = una rama = un Pull Request**

Cada funcionalidad, corrección o modificación deberá desarrollarse en una rama independiente.

No se deberán realizar cambios directamente sobre `main`.

---

## 2. Crear una rama

Antes de comenzar una nueva tarea, primero se deberá actualizar el repositorio local con los últimos cambios de la cátedra.

```bash
git checkout main
git pull upstream main
```

Luego se crea una nueva rama a partir de `main`.

### Convención de nombres

```text
feat/<descripcion>
fix/<algo>
docs/<tema>
refactor/<descripcion>
test/<descripcion>
```

### Ejemplos

```bash
git checkout -b feat/registro-usuarios
```

```bash
git checkout -b fix/error-login
```

```bash
git checkout -b docs/actualizar-readme
```

Cada rama deberá estar relacionada con una única tarea o funcionalidad.

---

## 3. Regla de `main`

**Nadie debe realizar `push` directamente sobre `main`.**

Todos los cambios deberán ingresar mediante un **Pull Request (PR)**.

El flujo esperado es:

```text
main
  ↓
crear rama
  ↓
desarrollar feature
  ↓
commits
  ↓
push de la rama
  ↓
Pull Request
  ↓
review de un compañero
  ↓
merge a main
```

---

## 4. ¿A dónde se envían los Pull Requests?

Esta regla es **obligatoria**.

Los Pull Requests deberán dirigirse **SIEMPRE a la rama `main` del fork del equipo**:

```text
TU_USUARIO/TCI_S32_2026
```

**NUNCA** se deberá crear un Pull Request hacia el repositorio base de la cátedra:

```text
desasoftfrlptn/TCI_S32_2026
```

El repositorio de la cátedra se utiliza **solamente como `upstream` para recibir cambios**.

### Resumen

```text
desasoftfrlptn/TCI_S32_2026
          │
          │ pull
          ↓
TU_USUARIO/TCI_S32_2026
          │
          │ PR
          ↓
      main del fork
```

Por lo tanto:

* **Del repo de la cátedra:** se reciben cambios.
* **Al fork del equipo:** se envían los Pull Requests.
* **Al repo de la cátedra:** nunca se envían Pull Requests.

---

## 5. Mantener el fork actualizado

Antes de comenzar una nueva feature, se deberá actualizar la rama `main` local con los cambios disponibles en el repositorio de la cátedra.

Primero se debe verificar que `upstream` esté configurado correctamente:

```bash
git remote -v
```

El `upstream` deberá apuntar al repositorio de la cátedra:

```text
https://github.com/desasoftfrlptn/TCI_S32_2026.git
```

Luego:

```bash
git checkout main
git pull upstream main
```

Después de actualizar `main`, se podrá crear la nueva rama:

```bash
git checkout -b feat/<descripcion>
```

---

## 6. Convención de commits

El proyecto utiliza **Conventional Commits**.

Los principales tipos utilizados serán:

| Tipo       | Uso                           |
| ---------- | ----------------------------- |
| `feat`     | Nueva funcionalidad           |
| `fix`      | Corrección de errores         |
| `docs`     | Documentación                 |
| `refactor` | Refactorización               |
| `test`     | Pruebas                       |
| `chore`    | Mantenimiento o configuración |

### Ejemplos

```text
feat: agregar registro de usuarios
fix: corregir validacion del login
docs: agregar contributing
refactor: reorganizar servicio de usuarios
test: agregar pruebas de autenticacion
chore: actualizar dependencias
```

Los mensajes deberán ser claros, breves y describir el cambio realizado.

---

## 7. Pull Requests

Una vez terminada la funcionalidad, se deberá subir la rama al fork:

```bash
git push origin feat/<descripcion>
```

Luego se deberá crear un Pull Request.

El PR deberá:

* Tener un título claro.
* Explicar brevemente qué cambios se realizaron.
* Indicar la tarea o funcionalidad implementada.
* Informar las pruebas realizadas.
* Dirigirse a `main` del fork del equipo.
* No dirigirse al repositorio de la cátedra.

---

## 8. Revisión y aprobación

Todo Pull Request deberá contar con **al menos 1 review aprobatoria de un compañero** antes de realizar el merge.

El autor del Pull Request **no puede aprobar su propio PR ni realizar el merge de su propio cambio**.

El compañero que realiza la revisión deberá verificar como mínimo:

* Que el cambio corresponda a la tarea solicitada.
* Que el código sea comprensible.
* Que respete las convenciones del proyecto.
* Que no existan errores evidentes.
* Que las pruebas correspondientes hayan sido realizadas.

Si se solicitan cambios durante la revisión, el autor deberá corregirlos antes de realizar el merge.

---

## 9. Merge

Una vez que:

1. El desarrollo esté terminado.
2. El Pull Request esté correctamente dirigido a `main` del fork.
3. Se haya realizado la revisión.
4. Exista al menos **1 aprobación de un compañero**.
5. No queden cambios solicitados pendientes.

El Pull Request podrá ser integrado a `main`.

El autor del PR **no deberá realizar el merge de su propio Pull Request**.

---

## 10. Flujo completo de trabajo

El flujo estándar para colaborar en Fit Hub será:

```bash
# 1. Actualizar main desde la cátedra
git checkout main
git pull upstream main

# 2. Crear una rama
git checkout -b feat/nueva-funcionalidad

# 3. Realizar los cambios

# 4. Preparar los cambios
git add .

# 5. Crear el commit
git commit -m "feat: agregar nueva funcionalidad"

# 6. Subir la rama al fork
git push origin feat/nueva-funcionalidad

# 7. Crear Pull Request
```

Luego otro integrante deberá revisar y aprobar el PR antes del merge.

---

## 11. Regla fundamental

> **Una feature = una rama = un Pull Request.**
>
> **Nadie pushea directamente a `main`.**
>
> **Los PR siempre van a `main` del fork del equipo y nunca al repositorio base de la cátedra.**
