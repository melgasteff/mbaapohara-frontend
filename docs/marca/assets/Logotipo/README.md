# Logotipo

Todos los archivos son SVG con colores fijos (no heredan `color`): elegí el archivo según el fondo.

- `horizontal-light.svg` — Logotipo principal: isotipo + nombre. Burbujas `yerba` (#0e5c4f) y `tierra` (#e4643f), nombre `ink` (#17302b). Sobre `surface` o fondos claros.
- `horizontal-dark.svg` — Igual, con burbujas #4cc2a6 y #f28b66 y nombre #ecf2ef. Sobre `surface` del tema oscuro o fondos oscuros.
- `horizontal-negro.svg` / `horizontal-blanco.svg` — Una sola tinta (#000000 / #ffffff) para impresión, sellos, fotos o rellenos `yerba`/`tierra`.
- `compacto-light.svg`, `compacto-dark.svg`, `compacto-negro.svg`, `compacto-blanco.svg` — Isotipo arriba y nombre abajo, para formatos cuadrados o verticales.
- `isotipo-light.svg`, `isotipo-dark.svg`, `isotipo-negro.svg`, `isotipo-blanco.svg` — El signo solo, para avatares, ícono de app y espacios mínimos.
- `horizontal-light.png`, `horizontal-dark.png`, `compacto-light.png`, `isotipo-light.png` — Exportaciones de 512px de alto para herramientas que no aceptan SVG.

La lente central de cada isotipo es transparente: deja ver el fondo.

> **Nota para este proyecto:** el manual exportado no incluye estos archivos. En `public/marca/logos/` están
> `logo-horizontal.svg` e `isotipo.svg`, extraídos del encabezado del manual, y `favicon.svg`.
> Sus colores salen de los tokens (`--yerba`, `--tierra`, `--ink`) cuando el SVG va en línea, y caen a
> los colores claros del manual cuando se usa como imagen.
