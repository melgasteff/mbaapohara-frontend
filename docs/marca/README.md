**Mbaapohara** («trabajador, trabajadora» en guaraní) es una plataforma para que las personas que trabajan en Paraguay cuenten cómo es trabajar en cada empresa y para que quienes buscan empleo decidan con información real.

- **Concepto:** la voz de los trabajadores.
- **Eslogan:** Tu experiencia vale.
- **Personalidad:** social, participativa, cercana y confiable.
- **Público:** trabajadores y personas que buscan empleo en Paraguay, desde un primer empleo hasta perfiles con años de experiencia. Muchos entran desde el celular.

Mbaapohara **no es** un muro de denuncias ni una red social. No tiene perfiles públicos, seguidores ni «me gusta». Es un lugar sereno, ordenado y transparente donde una experiencia contada con respeto ayuda a otra persona. Toda decisión visual se mide contra eso: si algo parece alarma, escándalo o feed infinito, está mal.

## Voz y tono

Hablamos como una compañera de trabajo que ya pasó por ahí: clara, cálida y sin vueltas.

- Tratá a la persona de **vos**, como se habla en Paraguay: «Contá tu experiencia», «Buscá una empresa», «Calificá del 1 al 5». El eslogan «Tu experiencia vale» funciona igual con vos y con tú.
- Frases cortas, en positivo y con verbo al inicio en botones y títulos de acción.
- Usá lenguaje inclusivo sin barras ni arrobas: «la persona que trabaja», «quienes buscan empleo», «Sé la primera persona en contar». Nunca «trabajador/a» ni «trabajador@s».
- Nombrá la crítica como mejora: el bloque se llama «A mejorar», no «Lo malo». Pedí hechos, no adjetivos: «¿Se pagan las horas extra?» antes que «¿Es una mala empresa?».
- Recordá el anonimato cada vez que la persona escribe algo: «Tu nombre nunca se muestra.»
- Números a la paraguaya: coma decimal y punto de miles («4,2», «1.250 reseñas»), guaraníes como «Gs. 3.500.000» (DM Sans no incluye el signo ₲).
- Sin emojis en la interfaz, sin signos de exclamación dobles y sin mayúsculas sostenidas. Sí podés usar palabras en guaraní de uso común en campañas, siempre con contexto en castellano.

| Hacé | Evitá |
| --- | --- |
| «Contá cómo te fue en Supermercado Central.» | «¡¡Denunciá a tu empresa!!» |
| «A mejorar: las horas extra se pagan tarde.» | «Lo peor: te explotan.» |
| «Todavía no hay reseñas. Sé la primera persona en contar.» | «No hay datos.» |
| «Tu reseña está en revisión.» | «Pendiente.» |

## Logotipo

### El isotipo

Dos globos de diálogo se encuentran. Cada globo es una voz: la de la izquierda en `yerba`, la de la derecha en `tierra`. Juntos dibujan una **M**: las dos curvas son la parte superior de la letra y las dos colas de los globos son sus patas. Donde las voces se superponen queda un espacio en forma de lente: lo que se comparte. Ese hueco es parte del signo y siempre queda vacío.

Está hecho con dos círculos del mismo radio, separados por 24 unidades de una retícula de 64, y colas rectas. No tiene maletines, edificios ni manos. Funciona en una sola tinta y se lee a 16px.

### El logotipo

El nombre se escribe en minúsculas, en DM Sans Bold con interletrado ajustado, convertido a trazos. Va siempre a la derecha del isotipo (horizontal) o debajo (compacto). En texto corrido el nombre se escribe con mayúscula inicial: Mbaapohara.

### Versiones

| Versión | Archivo | Usala para |
| --- | --- | --- |
| Horizontal | `horizontal-light.svg` | Encabezado web, documentos, presentaciones. Versión principal. |
| Horizontal sobre oscuro | `horizontal-dark.svg` | Tema oscuro, fondos `ink` o fotos oscuras. |
| Compacto | `compacto-light.svg`, `compacto-dark.svg` | Espacios cuadrados o verticales: portada de la app, afiches, perfil de redes. |
| Isotipo | `isotipo-light.svg`, `isotipo-dark.svg` | Ícono de app, avatar de redes y espacios donde el nombre ya aparece. |
| Monocromo negro | `*-negro.svg` | Impresión a una tinta, sellos, fotocopias, documentos oficiales de la facultad. |
| Monocromo blanco | `*-blanco.svg` | Sobre fotos o sobre `yerba` o `tierra` llenos. |
| Favicon | `favicon.svg` y PNG | Pestaña del navegador y accesos directos (cambia solo en modo oscuro). |

### Área de reserva y tamaños mínimos

- Dejá libre alrededor del logo un espacio igual a **x**, el ancho de la lente central (aprox. 1/5 de la altura del isotipo). Nada de texto, bordes ni otros logos dentro de ese margen.
- Horizontal: mínimo 120px de ancho en pantalla y 30mm impreso.
- Compacto: mínimo 72px de ancho en pantalla.
- Isotipo: mínimo 16px (favicon). Por debajo de 24px usá siempre la versión a color o la negra, nunca un contorno.

### Usos incorrectos

- No rellenes la lente central ni la pintes de otro color.
- No cambies los colores de las burbujas ni las inviertas (`tierra` a la izquierda).
- No rotes, deformes, agregues sombras, contornos ni degradados.
- No pongas el logo a color sobre `tierra` o `yerba` lleno: usá la versión blanca.
- No reescribas el nombre con otra fuente ni lo pongas en mayúsculas.
- No uses las burbujas sueltas como emoji o decoración.

## Color

La paleta mezcla el verde profundo de la yerba con el naranja de la tierra colorada. Los neutros son cálidos, color papel, para que la plataforma se sienta humana y no como un portal corporativo frío.

- **Proporción:** 70% neutros (`surface`, `surface-raised`, `ink`), 20% `yerba`, 10% `tierra`. `tierra` es el acento: aparece poco y por eso se nota.
- `yerba` es el color de acción: botón primario, enlaces, selección, foco del campo. El texto sobre `yerba` es `on-yerba`.
- `tierra` es calidez y participación: la burbuja derecha del logo, el CTA de campañas, ilustraciones y el ícono de «A mejorar». No escribas texto en `tierra`; si necesitás el acento como texto usá `tierra-text`. Sobre `tierra` lleno el texto es `on-tierra` (oscuro), nunca blanco.
- `sol` se reserva para las estrellas de calificación.
- Los `*-soft` son fondos de tinte para etiquetas, avisos y estados vacíos; encima va `ink` o el color de texto de su familia.
- Los colores de estado (`success`, `warning`, `danger`) siempre van con palabra e ícono. `danger` se usa en errores de formulario, no para calificaciones bajas: una reseña de 1 estrella no es un error.
- **Tema oscuro:** todos los tokens tienen valor para «Oscuro». En oscuro `yerba` y `tierra` se aclaran y el texto sobre ellos pasa a ser oscuro: siempre usá los tokens `on-*`, nunca blanco literal.
- Todos los pares de texto cumplen WCAG 2.1 AA (4,5:1) en ambos temas; bordes de control, foco, íconos y estrellas cumplen 3:1.

## Tipografía

Una sola familia: **DM Sans** (Google Fonts, licencia OFL), variable. Es geométrica y amable, muy legible en pantallas chicas y tiene todos los signos del castellano y del guaraní (ñ, ã, ẽ, ĩ, õ, ũ, ỹ, g̃ con tilde combinable y el puso ’).

- Titulares en peso 700 (`display`, `h1`, `h2`) con interletrado levemente negativo; `h3` en 600.
- Texto de interfaz y reseñas en `body` (16px). Nunca menos de 16px para texto que la persona escribe o lee de corrido.
- `body-lg` para el cuerpo de una reseña abierta en su página propia.
- `label` (600) para etiquetas de campo, botones y pestañas.
- `caption` solo para contadores e insignias, nunca para párrafos.
- Alineá a la izquierda. Largo de línea: 60–75 caracteres.
- Cargala desde los archivos de este sistema (`fonts/DMSans-Variable.ttf` y su itálica) o desde Google Fonts con `family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000`.

## Espacio y diagramación

- Base de 4px. Usá solo los pasos `space-1` a `space-8`.
- Relleno de tarjetas: `space-5`. Separación entre tarjetas: `space-5`. Entre secciones: `space-7`.
- Contenedor máximo de 1200px, centrado, con margen lateral `space-4` en móvil y `space-6` desde 1024px.
- Grilla: 4 columnas en móvil (<640px), 8 en tableta (640–1023px), 12 en escritorio (≥1024px). Medianil de 16px en móvil y 24px desde tableta.
- Diseñá primero para móvil a 360px de ancho.
- Áreas táctiles de al menos 44 × 44px.

## Formas

- **La esquina de diálogo** es la firma de la interfaz: las tarjetas que contienen la voz de una persona (reseñas, citas, testimonios) llevan `radius-lg` en tres esquinas y `radius-xs` abajo a la izquierda, como un globo de diálogo. No la uses en tarjetas de empresa, modales ni botones.
- Botones `radius-md`; campos `radius-sm`; tarjetas y modales `radius-lg`; etiquetas, chips y buscador `radius-pill`.
- Bordes de 1px `line` en tarjetas; 1.5px `line-strong` en controles.
- Sombras suaves y escasas: `shadow-sm` en reposo, `shadow-md` en hover, `shadow-lg` solo en modales.

## Iconografía

- Íconos de trazo, 24px de retícula, trazo de 2px, extremos redondeados, sin relleno, en `currentColor`. La librería recomendada para el frontend es **Lucide** (licencia ISC), que tiene ese mismo estilo. Los íconos de las vistas previas de este sistema están dibujados a mano con esas reglas.
- Tamaños: 20px junto a texto de 15–16px, 16px en ayudas y botones chicos, 14px en etiquetas.
- Un ícono nunca va solo si la acción no es universal (buscar, cerrar). En los demás casos, acompañalo de texto.
- No uses emojis como íconos.

## Imágenes e ilustración

- Preferí fotos reales de personas trabajando en Paraguay (mercados, oficinas, obras, call centers, campo), con luz natural y encuadres cercanos. Nada de bancos de imágenes con trajes y apretones de manos.
- Nunca muestres caras en contextos de reseñas: el anonimato también es visual.
- Para ilustraciones usá formas planas con `yerba`, `tierra`, `sol` y los neutros, y retomá el círculo con cola de las burbujas.

## Movimiento

- Transiciones de 150ms con `ease` para hover y foco; 200–250ms para abrir menús y modales.
- Nada de rebotes ni animaciones decorativas en bucle. Respetá `prefers-reduced-motion`.

## Accesibilidad

- Foco de teclado visible en todo elemento interactivo: contorno sólido de 2px en `focus` con 2px de separación.
- Toda calificación muestra el número además de las estrellas; todo estado muestra palabra e ícono.
- Los campos tienen etiqueta visible; los errores se anuncian con `aria-describedby`.
- `lang="es"` en el documento y `lang="gn"` en fragmentos en guaraní.
