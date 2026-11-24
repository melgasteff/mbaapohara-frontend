# Adaptaciones del manual de marca para este proyecto

Desde el 23/11/2026 la marca es la del rediseño: las láminas del diseño mandan en lo visual. El manual anterior
(`docs/marca/README.md` y `docs/marca/components/`) solo sigue vigente en voz y tono. Este archivo registra dónde el
proyecto se aparta de las láminas o las concreta, según las decisiones del PFG
Si algo de este archivo choca con ellas, gana este archivo.

## Implementación
- Componentes standalone de Angular con las clases `mb-` de `src/styles/mb-components.css`.
  **Sin Angular Material.** Íconos: `@lucide/angular` (trazo de 2px).
- Los tokens viven solo en `src/styles/mb-tokens.css`. En los componentes no se escriben colores, fuentes,
  radios ni sombras a mano. Solo hay tema claro.
- `.mb-field` trae un ancho fijo de 320px. En los formularios se usa a ancho completo, con un máximo razonable
  en escritorio.
- Diseño primero para móvil a 360px; contenedor de 1280px en escritorio.

## Diferencias con las láminas
- `--borde-control` es `#7A8499` y no `#8A94A8`, para llegar a 3:1 sobre crema. El texto tenue usa `--noche-suave`:
  `#8A94A8` sobre blanco queda en 3,05:1 y el ejemplo del buscador del inicio (`#5B83C0`) en 3,33:1.
- Tokens agregados: `--azul-hover` y `--pie-texto`.
- Los radios de 10px de las láminas pasan a 8 o 12. Sello de empresa: 72, 48 y 36px.
- Cuando el texto de una lámina choca con los datos o con la política de moderación, mandan los datos y la política:
  5 reglas de contraseña, los contratos y modalidades del catálogo, las palabras de las estrellas del JSON, los
  rechazos automáticos y el plazo de 48 horas.
- Grupos de rubro por sección CIIU: Comercio (G), Industria y construcción (B a F), Gastronomía (I), Transporte (H),
  Servicios y oficinas (J a R, T y U) y Agro y otros (A y S), que reemplaza a «Talleres y oficios».
- Encabezado: el menú desplegable aparece por debajo de 1160px (no 760), porque con sesión la navegación no entra.
  Con sesión, «Cómo moderamos» queda solo en el pie, como en la lámina 07. En el asistente a 360px el logo baja a 22px.
- Administración y asistente no llevan pie, como en sus láminas. La administración usa el contenedor de 1280px.
- Asistente: «Salir sin guardar» hasta que exista el borrador (fase 4). Se evita «Salir», que cierra la sesión.
- Pie: sin «Responsabilidad por las reseñas» hasta que exista su página (fase 6).
- Sello: las iniciales saltan artículos, preposiciones y tipos de sociedad («Supermercado La Amistad» es «SA»), como
  pide el documento; la lámina 00 dice «LA». «Agro y otros» usa la ilustración 12 (herramientas).
- Fila de empresa: «Muy comentada» desde 50 reseñas (TODO(decision) en el código). El tema principal es la primera
  categoría de criterios, la misma para todas; con 3 reseñas o más puede no aparecer, si menos de 3 la respondieron.
- Temas: son las **categorías** de criterios, no los ítems cortos de las láminas (provisional hasta el 26/11).
- Moderación: no se resalta el fragmento marcado, porque la API no lo devuelve.
- Asistente: sin «¿No está la empresa? Proponela», porque ese flujo no existe.

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
  No sé o no aplica) que se ven como botones en grilla, pero se implementan como un grupo de radios
  (`role="radiogroup"`) para que funcionen con teclado.
- Sin rojo en ningún lado. El «No», los rechazos, los errores y «Borrar» usan `--naranja-texto` (sobre
  `--naranja-suave` en las etiquetas), siempre con palabra o ícono.
- Los porcentajes de cumplimiento se muestran con número y palabra, en colores neutros o azul.

## Estados de moderación (etiquetas)
- Publicada: `.mb-tag-success`.
- En revisión: `.mb-tag-warning`, con el texto del manual: «Tu reseña está en revisión. Te avisamos en 48 horas.»
- Rechazada: `.mb-tag-naranja` con el texto «Necesita un cambio», visible solo para quien la escribió, junto con el motivo.

## Datos de ejemplo
- Las empresas y locales de la demo son reales: vienen de la semilla del backend (decisión del 19/11).
  Las reseñas, personas y textos de ejemplo siempre son ficticios: nunca se le atribuye una opinión inventada
  a una empresa real. Por eso el perfil muestra el estado vacío y no reseñas simuladas.
- Los nombres del manual («Supermercado Central», «Distribuidora Ñandutí») son ficticios y se pueden usar
  en vistas previas y en la documentación.
