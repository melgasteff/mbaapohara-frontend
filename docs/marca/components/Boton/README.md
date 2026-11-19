# Boton

Dispara una acción; el primario (`.mb-btn-primary`, relleno `yerba`) se usa una sola vez por pantalla, para lo que esa pantalla existe.

**Qué aporta quien lo usa:** un `<button>` (o `<a>` si navega) con `.mb-btn` más una variante; el texto; opcionalmente un ícono de 20px antes del texto.

| Variante | Clase | Cuándo |
| --- | --- | --- |
| Primario | `.mb-btn-primary` | La acción principal: «Escribí tu reseña», «Publicar reseña». |
| Acento | `.mb-btn-accent` | Solo en portada y campañas para invitar a participar. Nunca junto al primario. |
| Secundario | `.mb-btn-secondary` | Acciones alternativas: «Ver empresa», «Guardar borrador». |
| Fantasma | `.mb-btn-ghost` | Acciones de bajo peso: «Cancelar», «Ver más». |

- Tamaño por defecto 44px de alto (área táctil mínima); `.mb-btn-sm` (36px) solo en barras densas de escritorio.
- Texto con verbo en voseo y en mayúscula inicial: «Publicá», «Escribí tu reseña». Nada de «Click aquí» ni de todo en mayúsculas.
- Deshabilitado con `disabled`; si la acción no está disponible, decí por qué al lado del botón.
