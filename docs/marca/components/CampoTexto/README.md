# CampoTexto

Campo de texto de una línea o de varias (`textarea`) con etiqueta visible, ayuda y estado de error.

**Qué aporta quien lo usa:** un contenedor `.mb-field`; un `<label for>` siempre visible; un `<input>` o `<textarea>` con `.mb-input`; opcionalmente `.mb-help` debajo. Para el error agregá `.mb-field-error` al contenedor, `aria-invalid="true"` al campo y `aria-describedby` apuntando al mensaje.

- El placeholder da un ejemplo («Ej.: cajera, chofer»), nunca reemplaza a la etiqueta.
- Los mensajes de error dicen cómo resolverlo: «Escribí al menos 10 caracteres», no «Campo inválido».
- Cerca de cualquier dato que pueda identificar a la persona, mostrá la ayuda con candado: «Tu nombre nunca se muestra.»
- Borde `line-strong` en reposo, `yerba` con foco, `danger` con error.
