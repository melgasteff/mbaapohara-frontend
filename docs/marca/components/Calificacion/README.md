# Calificacion

Muestra o recoge una calificación de 1 a 5 estrellas; el número siempre acompaña a las estrellas.

**Qué aporta quien lo usa:** el promedio con un decimal y coma decimal («4,2»), la cantidad de reseñas y cinco íconos de estrella (`.mb-star-full` / `.mb-star-empty`).

- Lectura: `.mb-rating` con `.mb-stars`, `.mb-rating-value` y `.mb-rating-count`.
- Chip compacto: `.mb-rating-chip` sobre `sol-soft`, para listados y mapas.
- Entrada: un `fieldset.mb-star-input` con `legend`, estrellas de 28px (`.mb-stars-lg`) y la palabra del valor al lado: 1 Muy malo, 2 Malo, 3 Regular, 4 Bueno, 5 Excelente. Implementalo con radios para que funcione con teclado.
- Las estrellas son `sol`. No uses estrellas de color para otra cosa.
