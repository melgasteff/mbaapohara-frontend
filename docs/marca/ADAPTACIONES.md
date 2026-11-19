# Adaptaciones del manual de marca para este proyecto

El manual (`docs/marca/README.md` y `docs/marca/components/`) manda en lo visual y en la voz.
Este archivo registra dónde el proyecto se aparta del manual o lo concreta, según las decisiones del PFG
Si algo de este archivo choca con el manual, gana este archivo.

## Implementación
- Componentes standalone de Angular con las clases `mb-` de `src/styles/mb-components.css`.
  **Sin Angular Material.** Íconos: `@lucide/angular` (trazo de 2px, como pide el manual).
- Los tokens viven solo en `src/styles/mb-tokens.css`. En los componentes no se escriben colores, fuentes,
  radios ni sombras a mano.
- `.mb-field` trae un ancho fijo de 320px pensado para la vista previa. En los formularios de la aplicación
  se usa a ancho completo, con un máximo razonable en escritorio.
- Solo tema claro por ahora. Los tokens del tema oscuro quedan disponibles para más adelante.
- Diseño primero para móvil a 360px. En móvil, el buscador del encabezado baja a una segunda fila y la
  navegación pasa a un menú (como indica el README del Encabezado).

## Voz
- Voseo en toda la interfaz: «Buscá una empresa», «Escribí tu reseña», «Contá tu experiencia».
- Números con coma decimal y punto de miles.
- Mensaje de anonimato cerca de todo campo donde la persona escribe: «Tu nombre nunca se muestra.»

## Reseña (decisiones R2 a R7 del PLAN)
- **Texto en dos campos obligatorios**, como en el manual: «Lo bueno» y «A mejorar», de 50 a 1.000
  caracteres cada uno, con contador.
- **Sin título.** La tarjeta de reseña no muestra el h3 de la vista previa.
- **Sin etiqueta «Empleo verificado».** El proyecto no verifica el empleo (decisión D6).
- **Sin botón «Útil».** Votar reseñas está fuera del alcance del PFG.
- **Metadatos sin género:** «Trabaja aquí» o «Trabajó aquí» · cargo · ciudad · último año (por ejemplo,
  «hasta 2025»). Nunca «Ex empleada» ni «Ex empleado», porque no se pregunta el género.
- **Calificación general:** entrada de 1 a 5 estrellas con radios y la palabra del valor:
  1 Muy malo, 2 Malo, 3 Regular, 4 Bueno, 5 Excelente.
- **Criterios de cumplimiento:** cada afirmación se responde con cuatro opciones (Sí / En parte / No /
  No sé o no aplica) que se ven como `.mb-chip`, pero se implementan como un grupo de radios
  (`role="radiogroup"`) para que funcionen con teclado.
- Ninguna respuesta «No» y ninguna calificación baja usan `danger`. `danger` es solo para errores de formulario.
- Los porcentajes de cumplimiento se muestran con número y palabra, en colores neutros o `yerba`.

## Estados de moderación (etiquetas)
- Publicada: `.mb-tag-success`.
- En revisión: `.mb-tag-warning`, con el texto del manual: «Tu reseña está en revisión. Te avisamos en 48 horas.»
- Rechazada: `.mb-tag-danger`, visible solo para quien la escribió, junto con el motivo.

## Datos de ejemplo
- Las empresas y locales de la demo son reales: vienen de la semilla del backend (decisión del 19/11).
  Las reseñas, personas y textos de ejemplo siempre son ficticios: nunca se le atribuye una opinión inventada
  a una empresa real. Por eso el perfil muestra el estado vacío y no reseñas simuladas.
- Los nombres del manual («Supermercado Central», «Distribuidora Ñandutí») son ficticios y se pueden usar
  en vistas previas y en la documentación.
