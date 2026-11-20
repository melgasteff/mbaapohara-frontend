# Mbaapohara — frontend

Aplicación web de una plataforma donde trabajadores publican reseñas laborales anónimas y moderadas sobre
empresas y locales de Paraguay, y cualquier persona las consulta, filtra y ve indicadores agregados.

Proyecto Final de Grado, Ingeniería en Informática, FCyT-UNCA.

- **Stack:** Angular 22 (componentes standalone, sin zone.js), Reactive Forms, `@lucide/angular`. Sin librería
  de componentes: estilos del manual de marca (`src/styles/mb-*.css`, [docs/marca/](docs/marca/README.md)).
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
| Inicio | `/` | Buscador y accesos. «Conocé tus derechos» figura como «Próximamente» (tarea 3.7) |
| Directorio de empresas | `/empresas` | **Reales:** búsqueda por nombre, filtro por departamento y ciudad, paginación |
| Perfil de empresa | `/empresas/:id` | **Reales:** empresa, rubro y locales. Reseñas: estado vacío hasta la Fase 3 |
| Escribí tu reseña | `/publicar` | Exige sesión. **Reales:** empresas, locales, cargos, tipos de contrato y modalidades. Criterios del JSON provisional. **Prototipo:** el envío no guarda nada |
| Ingresar, crear cuenta | `/ingresar`, `/registro` | **Reales:** JWT de la API; la sesión se guarda en `sessionStorage` y vence con el token |
| Administración | `/admin/…` | Solo administradores. **Reales:** empresas por estado (aprobar, rechazar, eliminar), alta de empresa con su primer local, gestión de una empresa aprobada y sus locales, cola de locales pendientes y cargos |

- **Criterios provisionales:** [public/criterios-provisionales.json](public/criterios-provisionales.json), tomados
  de las preguntas 5 a 8 del cuestionario. Se reemplazan con los resultados de la encuesta cambiando solo ese
  archivo.
- **Moderación simulada:** `src/app/mocks/reviews-api.mock.ts`. Si el texto tiene un correo o un número de seis
  dígitos o más (teléfono o cédula), la reseña queda «En revisión»; si no, «Publicada». La moderación real es la
  tarea 2.3.
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
   1. empresa y local (probar «Siguiente» vacío para mostrar la validación);
   2. relación laboral (mostrar «Mi cargo no está en la lista» y que solo se pide el año);
   3. los 23 criterios con Sí / En parte / No / No sé o no aplica;
   4. estrellas y los dos textos, con contador y el recordatorio de anonimato.
4. **Publicar** → «Publicada», con la vista previa de la tarjeta.
5. **«Escribir otra reseña»** y poner un teléfono en «Lo bueno» (por ejemplo «llamá al 0981 123 456») →
   «En revisión», con el motivo. Explicar que la moderación real combina reglas, un modelo de lenguaje y
   revisión humana (Fase 2).
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
  shared/     piezas visuales reutilizables: logo, tarjetas, estados, estrellas, respuestas
  features/
    public/   inicio, directorio, perfil, ingresar y registro
    worker/   asistente de publicación
    admin/    administración
  mocks/      implementaciones simuladas, detrás de la misma interfaz que el servicio real
public/       fuentes, logos y criterios provisionales (archivos estáticos)
docs/         plan, decisiones, demo y manual de marca
```
