# Mantenimiento Pharma — React + TypeScript

Prototipo funcional de una aplicación web para gestión de repuestos, stock, incidencias y mantenimiento. Las pantallas y los elementos de interfaz están implementados como componentes React; los datos de dominio y callbacks se pasan mediante props.

## Pantallas incluidas

Login, menú móvil, dashboard de escritorio, stock, detalle de repuesto, trazabilidad, escaneo, registro de uso, alertas, reconocimiento por foto, incidencias y su formulario, mantenimientos y formulario, compras y pedido, recepción de stock, reservas, máquinas y alta, reportes, perfil y notificaciones por correo.

## Estructura

```text
mantenimiento-pharma/
	README.md
	src/
		main.tsx          # Estado y navegación, comentados didácticamente
		AppLayout.tsx     # Navegación de escritorio y móvil
		UI.tsx            # Componentes reutilizables con props tipadas
		types.ts          # Tipos de dominio
		styles.css        # Estilos responsive
	index.html
	package.json
	tsconfig.json
	vite.config.ts
```

## Componentes y tipos

La entrada es `src/main.tsx`. `src/types.ts` define los modelos `Part`, `Machine`, `Incident` y `User`; `src/UI.tsx` y `src/AppLayout.tsx` exportan componentes que reciben datos y acciones mediante props tipadas. `App` conserva el estado del prototipo y coordina la navegación.

## Ejecutar

Requiere Node.js 18+.

```bash
npm install
npm run dev
```

Luego abrir la URL que indique Vite, normalmente:
http://localhost:5173

`npm run build` ejecuta primero el chequeo estricto de TypeScript y luego genera el bundle de producción.

## Próximo paso recomendado

Este proyecto es un frontend/prototipo. Para llevarlo a producción habría que conectar:
- API REST (Node/Spring Boot/PHP)
- Base de datos SQL
- Autenticación y roles
- Cámara/lector QR y código de barras real
- Almacenamiento de fotos
- Servicio de correo
- Auditoría y trazabilidad persistente
