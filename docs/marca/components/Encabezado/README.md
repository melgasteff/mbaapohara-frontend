# Encabezado

Barra superior de escritorio con el logotipo horizontal, el buscador de empresas y la navegación principal.

**Qué aporta quien lo usa:** el logotipo (SVG en línea con las clases `.a`, `.b` y `.w` para que siga el tema, o el archivo `horizontal-light`/`horizontal-dark`), el buscador `.mb-search` y los enlaces en `.mb-nav`, con `aria-current="page"` en la sección activa.

- El único botón primario del encabezado es «Escribí tu reseña».
- Altura del logo: 32px en escritorio, 28px en móvil. En móvil, el buscador baja a una segunda fila y la navegación pasa a un menú.
- Fondo `surface-raised` con borde inferior `line`; nunca sobre fotos.

> **Nota para este proyecto:** en la vista previa, el SVG del logo se reemplazó por una referencia a
> `public/marca/logos/logo-horizontal.svg`, que es el mismo dibujo. En la aplicación conviene ponerlo
> en línea (dentro de un componente) para que siga los tokens del tema.
