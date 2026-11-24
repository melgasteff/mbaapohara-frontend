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
- Asistente, salida del encabezado: «Guardar y salir» en una reseña nueva, «Salir sin guardar» al editar (no hay borrador y
  parecería que guarda los cambios) o si el navegador no deja guardar, y «Volver al inicio» después de enviar. Se evita
  «Salir», que cierra la sesión.
- Asistente, paso 2: el cargo se busca en una lista al escribir; «Frecuentes» son los cargos con reseñas en esa empresa y no
  aparece si no hay. La situación y los contratos usan las palabras de los datos, y el año va del actual a 50 años atrás.
- Asistente, paso 3: el avance solo ocurre con clic, Enter o espacio; las flechas marcan y se sigue con «Seguir». El cierre dice
  «Jornada: lista» para no depender del género de la categoría. Sin aclaración por pregunta: la API no la tiene.
- Asistente, paso 4: la pregunta y las palabras de las estrellas son las del JSON.
- Asistente, barra inferior: lo que falta se muestra en la barra, en lugar de al final del paso, para que siempre se vea.
  Entre 760 y 1099px van dos columnas, con la barra de progreso en lugar de la lista de pasos.
- Asistente, vista previa: un cargo que no está en la lista se ve «Otro cargo», como en el perfil, y «No sé o no aplica» no se cuenta.
- Asistente, resultado: sin «Escribir otra reseña». El rechazo muestra el único motivo que devuelve la API.
- Sello: las iniciales saltan artículos, preposiciones y tipos de sociedad («Supermercado La Amistad» es «SA»), como
  pide el documento; la lámina 00 dice «LA». «Agro y otros» usa la ilustración 12 (herramientas).
- Fila de empresa: «Muy comentada» desde 50 reseñas (TODO(decision) en el código). El tema principal es la primera
  categoría de criterios, la misma para todas; con 3 reseñas o más puede no aparecer, si menos de 3 la respondieron.
- Temas: son las **categorías** de criterios, no los ítems cortos de las láminas (provisional hasta el 26/11).
- Inicio: «Quitamos datos personales e insultos» pasa a «Buscamos…», porque nunca cambiamos el texto de una reseña. El
  ejemplo del buscador rota entre rubros que la búsqueda encuentra. Los temas de «Conocé tus derechos» son una
  propuesta (TODO(decision) en el código). El título de la página (h1) es el sobretítulo.
- Directorio: sin «Proponer una empresa» ni «¿No está la empresa donde trabajaste?». Suma «Buscaste «…»» con «Quitar»,
  porque el encabezado y el inicio mandan una palabra. Con una ciudad elegida, la frase muestra la ciudad.
- Paginación: botones de 44px (40 en la lámina) y sin botones deshabilitados: en la primera página no hay «anterior».
- Perfil: las palabras de la distribución son las del JSON. Sin «Temas provisionales hasta el 26/11», que es una nota
  interna. Con 3 reseñas o más y ningún tema, una línea explica por qué faltan. Los locales sin reseñas se muestran pero
  no filtran. Sin «¿Falta un local? Proponelo…», porque ese flujo no existe.
- Perfil, franja «¿Sos de la empresa?»: explica los dos caminos y el botón es «Pedir una corrección». El pedido sobre una
  reseña exige elegirla, y desde el perfil el formulario solo corrige datos de la empresa.
- En móvil los chips miden 44px de alto (40 en la lámina).
- Ingresar y registro: 5 reglas de contraseña y los mensajes de la API. Sin avisos de «Ingresaste» ni «Cuenta creada»: al
  terminar se va a la página pedida. La casilla de 18 años se valida solo en la pantalla: la API recibe una sola aceptación.
- Mis reseñas: las pestañas usan el estado de la última versión, y se conserva «Mientras tanto, se sigue viendo tu versión
  anterior». La fecha dice siempre «enviada en»: la API no da el mes de publicación de las reseñas propias. «Ver» usa la
  tarjeta de reseña y, si está publicada, suma «Ver en el perfil».
- Mi cuenta: sin «Reseñas escritas», que `/users/me` no devuelve. Se conservan la fecha de aceptación de los términos y el enlace
  a Mis reseñas. Las fechas van completas, porque solo las ve su dueño.
- Páginas informativas: los textos siguen la política y lo que el sistema hace. El modelo sí rechaza solo cuando es claro, reportar
  exige cuenta, el sistema no envía correos a las cuentas y el nombre no se pide. Los ejemplos evitan «el encargado del turno noche» y
  «una persona de Recursos Humanos», que la política considera personas identificables, y «es una porquería», que no asegura un rechazo.
- Términos: las 7 reglas de la política (la lámina trae 4), en `/terminos#reglas`, adonde apunta el asistente.
- Privacidad: con quién compartimos, cuánto tiempo, protección, responsable y edad son secciones visibles con la estética de la lámina.
- Índice: marca la sección de la URL, no la que se está leyendo. Las preguntas y los términos completos son `<details>` nativos.
- 404: usa el encabezado sin buscador, para no mostrar dos.
- Administración: la entrada es Moderación. Los contadores cuentan lo pendiente: naranja en Moderación y neutro en el resto. En las
  pestañas de Empresas solo tienen número las que esperan una decisión.
- Moderación: no se resalta el fragmento marcado, porque la API no lo devuelve. El modelo da seis confianzas: se ve la de la categoría
  marcada y «Ver todas las confianzas».
- Solicitudes: la respuesta se escribe una vez y sirve para el correo y el registro. Al registrar se confirma, porque borra datos.
- Empresas: sin origen de la propuesta ni cantidad de locales y reseñas, que la API de administración no trae.
- Cargos: «Rechazar» en lugar de «Unificar», que no existe en la API. La lista son chips con botón para eliminar.
- Criterios: las flechas también ordenan categorías. Miden 44px (26 en la lámina). «Mantener» y «Registrar» confirman en azul, porque no
  borran reseñas.
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
- En revisión: `.mb-tag-warning`, con el texto «Tu reseña está en revisión.» (el sistema no envía avisos).
- Rechazada: `.mb-tag-naranja` con el texto «Necesita un cambio», visible solo para quien la escribió, junto con el motivo.

## Datos de ejemplo
- Las empresas y locales de la demo son reales: vienen de la semilla del backend (decisión del 19/11).
  Las reseñas, personas y textos de ejemplo siempre son ficticios: nunca se le atribuye una opinión inventada
  a una empresa real. Por eso el perfil muestra el estado vacío y no reseñas simuladas.
- Los nombres del manual («Supermercado Central», «Distribuidora Ñandutí») son ficticios y se pueden usar
  en vistas previas y en la documentación.
