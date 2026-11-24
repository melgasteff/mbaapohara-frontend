# Mbaapohara — frontend

Aplicación web de una plataforma donde trabajadores publican reseñas laborales anónimas y moderadas sobre
empresas y locales de Paraguay, y cualquier persona las consulta, filtra y ve indicadores agregados.

Proyecto Final de Grado, Ingeniería en Informática, FCyT-UNCA.

- **Stack:** Angular 22 (componentes standalone, sin zone.js), Reactive Forms, `@lucide/angular`. Sin librería
  de componentes: estilos de la marca (`src/styles/mb-*.css`).
- **API:** [mbaapohara-backend](../mbaapohara-backend/README.md) (NestJS). En desarrollo se espera en
  `http://localhost:3000` (`src/environments/environment.development.ts`).

## Requisitos

- Node.js 22 (`nvm use` toma la versión de `.nvmrc`).
- La API en marcha, con su base de datos y los datos de demostración (ver abajo).

## Puesta en marcha (API + frontend)

Los dos repositorios están uno al lado del otro (`mbaapohara-backend/` y `mbaapohara-frontend/`).

### 1. API

En `mbaapohara-backend/`, con el `.env` completo (copiar de `.env.example`; `CORS_ORIGINS` debe incluir
`http://localhost:4200`):

```bash
nvm use
npm install
npm run db:setup      # migraciones + datos de demostración (empresas, locales, catálogos)
npm run start:dev     # http://localhost:3000, Swagger en /docs
```

Con contenedores alcanza con `docker compose up --build`. Detalles en el [README del backend](../mbaapohara-backend/README.md).

### 2. Frontend

En `mbaapohara-frontend/`:

```bash
nvm use
npm install
npm start             # http://localhost:4200
```

Para comprobar que se hablan: `http://localhost:4200/empresas` debe listar las empresas de la semilla.

## Qué es real y qué es prototipo

| Pantalla | Ruta | Datos |
| --- | --- | --- |
| Inicio | `/` | **Reales:** frase-buscador (empresa, local o rubro) y ciudades con empresas. La reseña de muestra es ficticia y dice «Ejemplo». «Conocé tus derechos» figura como «Próximamente» (tarea 3.7) |
| Directorio de empresas | `/empresas` | **Reales:** búsqueda por empresa, local o rubro; filtros por grupo de rubro, departamento, ciudad y con o sin reseñas, con conteos; orden y paginación. Todo en la URL |
| Perfil de empresa | `/empresas/:id` | **Reales:** resumen (promedio, distribución y temas desde 3 reseñas), reseñas publicadas con los filtros de RF5, conteos y orden en la URL, y locales con su cantidad de reseñas |
| Escribí tu reseña | `/publicar`, `/publicar/:id/editar` | Exige sesión. **Real:** publica y edita con la API y muestra el resultado de la moderación. Los criterios vienen de `GET /criteria`. Una reseña nueva se guarda sola como borrador en `localStorage`, por cuenta y solo en ese dispositivo, hasta enviarla. `?empresa=` la empieza con la empresa elegida. Al editar, el local no cambia y no hay borrador |
| Mis reseñas | `/mis-resenas` | **Real:** la última versión de cada reseña propia con su estado y el motivo; editar, corregir y borrar (exige sesión) |
| Cómo moderamos, privacidad, términos | `/como-moderamos`, `/privacidad`, `/terminos` | Borradores (tarea 1.9), con enlaces en el pie, el registro y el asistente |
| Mi cuenta | `/mi-cuenta` | **Real:** ver los datos, descargarlos y eliminar la cuenta con sus reseñas (exige sesión) |
| Ingresar, crear cuenta | `/ingresar`, `/registro` | **Reales:** JWT de la API; la sesión se guarda en `sessionStorage` y vence con el token |
| Administración | `/admin/…` | Solo administradores. **Reales:** empresas por estado (aprobar, rechazar, eliminar), alta de empresa con su primer local, gestión de una empresa aprobada y sus locales, cola de locales pendientes, cargos (con los propuestos desde reseñas) **moderación** (`/admin/moderacion`: publicar o rechazar con motivo las reseñas en revisión, con las señales del modelo y sin el autor), **reportes** (`/admin/reportes`: mantener o retirar), **solicitudes de empresas** (`/admin/solicitudes`: responder por correo y registrar) y **criterios** (`/admin/criterios`: agregar, editar con aviso si ya tienen respuestas, activar o desactivar) |
| Solicitud de una empresa | `/solicitud-revision` | **Real:** formulario público para pedir revisar una reseña o corregir datos; se llega desde el perfil |

- **Criterios (3.8):** las categorías e ítems vienen de la API (`GET /criteria`) y se administran en
  `/admin/criterios`: alta, corrección de texto y orden, y activar o desactivar (no se borran). Los provisionales
  salen de las preguntas 5 a 8 del cuestionario y se ajustan desde esa pantalla con los resultados de la encuesta.
  [public/criterios-provisionales.json](public/criterios-provisionales.json) guarda solo la forma de la reseña
  (opciones de respuesta, situaciones, calificación y textos).
- **Publicación real (3.3):** el asistente publica con `POST /reviews` (`src/app/core/api/http-reviews-api.ts`) y
  muestra el resultado de la moderación real del backend. El simulador `src/app/mocks/reviews-api.mock.ts`, que imita
  dos filas de la [política de moderación](../mbaapohara-backend/docs/politica-moderacion.md), queda solo para
  probar los componentes sin la API.
- Las empresas y locales de la semilla son reales; las reseñas y textos de ejemplo siempre son ficticios.

### Cuenta de administrador

La base empieza sin usuarios. Para entrar a la administración, en `mbaapohara-backend/`:

```bash
npm run admin:create -- correo@ejemplo.com   # pide la contraseña sin mostrarla
```

Una cuenta común se crea desde `/registro`.

## Guion de la demo (5 minutos)

1. **Inicio → buscar «banco»** → directorio con resultados reales. Filtrar por Asunción → Asunción.
2. **Abrir una empresa** → perfil con sus locales agrupados por ciudad y el estado vacío de reseñas.
3. **«Escribí tu reseña»** → pide ingresar; crear una cuenta en `/registro` (se ven las reglas de la
   contraseña) y vuelve solo al asistente. Recorrer los 4 pasos:
   1. empresa y local (probar «Seguir» vacío para mostrar la validación);
   2. tu trabajo (escribir un cargo que no está en la lista y mostrar que solo se pide el año);
   3. tus derechos: los criterios de a uno, con Sí / En parte / No / No sé o no aplica («Guardar y salir» y volver para
      mostrar el borrador);
   4. estrellas y los dos textos, con contador y el recordatorio de anonimato.
4. **Enviar reseña** → «Publicada», con el enlace a la reseña en el perfil.
5. **Escribir otra reseña, de otro local,** y poner un teléfono en «Lo bueno» (por ejemplo «llamá al 0981 123 456») →
   «Necesita un cambio», con qué corregir. «Corregir la reseña» vuelve al paso 4 con todo lo escrito; sacar el
   teléfono → «Publicada». Con una acusación («la supervisora acosa a las cajeras») → «En revisión».
   Explicar la política: la crítica a la empresa siempre se publica; se modera lo que identifica o acusa a
   personas y lo que rompe el anonimato (Fase 2).
6. **Ingresar como administrador** → «Administración»: crear una empresa ficticia con su local, agregar un
   cargo común (por ejemplo «Cajera») y mostrar la cola de locales pendientes.
7. Cerrar con qué es real, qué es prototipo y qué falta.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm start` | Servidor de desarrollo con recarga en `http://localhost:4200` |
| `npm run build` | Compila para producción en `dist/` |
| `npm test -- --watch=false` | Pruebas unitarias (Vitest) |
| `npx ng g c features/<grupo>/<nombre>` | Genera una pantalla |

## Estructura

```
src/app/
  core/       lo que existe una sola vez: layout, modelos y servicios de la API (core/api)
  shared/     piezas visuales reutilizables: logo, sello, fila, reseña, filtros, estados, estrellas, respuestas
  features/
    public/   inicio, directorio, perfil, ingresar y registro
    worker/   asistente de publicación
    admin/    administración
  mocks/      implementaciones simuladas, detrás de la misma interfaz que el servicio real
public/       fuentes, logos, ilustraciones y la forma de la reseña (archivos estáticos)
docs/         plan, decisiones, demo y manual de marca
```
