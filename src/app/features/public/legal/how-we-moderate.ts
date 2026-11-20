import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * «Cómo moderamos» (tarea 1.9). Resume para el público la política de moderación del backend
 * (mbaapohara-backend/docs/politica-moderacion.md): si la política cambia, esta página también.
 */
@Component({
  selector: 'app-how-we-moderate',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './legal.css',
  template: `
    <article class="page legal" aria-labelledby="titulo">
      <h1 id="titulo" class="h1">Cómo moderamos</h1>
      <p class="meta body-sm"><span class="mb-tag">Borrador</span> Actualizada el 19 de noviembre de 2026</p>

      <div class="callout">
        <p class="body">
          Mbaapohara existe para que cuentes cómo trata una empresa a quienes trabajan en ella.
          <strong>La crítica a la empresa sobre hechos laborales siempre se publica</strong>, aunque sea dura.
          Moderamos para proteger a las personas y tu anonimato, no para filtrar opiniones negativas.
        </p>
      </div>

      <h2 class="h2" id="reglas">Reglas de publicación</h2>
      <p>Antes de enviar tu reseña aceptás estas reglas:</p>
      <ol>
        <li>Contá <strong>tu propia experiencia</strong> en esa empresa y ese local.</li>
        <li>Hablá de <strong>hechos sobre la empresa</strong>: pagos, horarios, contratos, trato, seguridad.</li>
        <li><strong>No nombres a nadie</strong>: ni nombres, ni apodos, ni descripciones que apunten a una sola persona.</li>
        <li><strong>No incluyas datos de contacto</strong>: teléfonos, correos, números de documento ni enlaces.</li>
        <li><strong>Sin insultos</strong>, discriminación ni amenazas.</li>
        <li><strong>Sin publicidad</strong> ni textos que no hablen de tu experiencia de trabajo.</li>
        <li>Una reseña por persona y local. Podés editarla; cada cambio vuelve a pasar por la moderación.</li>
      </ol>

      <h2 class="h2">Qué revisamos</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th scope="col">Revisamos</th><th scope="col">Por ejemplo</th><th scope="col">Sí se publica</th></tr>
          </thead>
          <tbody>
            <tr><td>Datos de contacto</td><td>«Llamá al 0981…», un correo, una cédula, un enlace</td><td>Montos de salario, fechas, horarios</td></tr>
            <tr><td>Personas identificables</td><td>«El gerente Juan Pérez», un apodo, «la cajera de la caja 3»</td><td>«Los encargados avisan tarde los horarios»</td></tr>
            <tr><td>Acusaciones de delitos contra una persona</td><td>«La supervisora roba»</td><td>«Hay acoso y la empresa no hace nada»</td></tr>
            <tr><td>Insultos, odio o discriminación</td><td>Insultos, también en jopara; desprecio por sexo, origen o religión</td><td>«Un desastre cómo pagan»</td></tr>
            <tr><td>Publicidad</td><td>Ofertas, promociones, avisos de empleo</td><td>Recomendar o no trabajar ahí</td></tr>
            <tr><td>Textos fuera de tema</td><td>Opiniones sobre la atención como cliente</td><td>Contexto breve sobre tu trabajo</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="h2">Cómo se decide</h2>
      <ol>
        <li><strong>Reglas automáticas</strong> buscan datos de contacto y palabras ofensivas.</li>
        <li>Un <strong>modelo de lenguaje</strong> analiza el texto. Solo recibe el texto de la reseña: nunca tu correo,
          tu cuenta ni la empresa.</li>
        <li>Si el resultado es claro, se publica o se rechaza explicando qué corregir. Si hay dudas, si la reseña acusa a
          una persona o si el servicio automático falla, <strong>la revisa una persona del equipo</strong>.</li>
      </ol>

      <h2 class="h2">Qué pasa con tu reseña</h2>
      <ul>
        <li><strong>Publicada:</strong> la ve cualquier persona, sin tu nombre.</li>
        <li><strong>En revisión:</strong> una persona del equipo la revisa en un plazo de 48 horas, sin saber quién la escribió.
          Mientras tanto solo la ves vos.</li>
        <li><strong>Rechazada:</strong> solo la ves vos, con el motivo y qué corregir. Podés editarla y volver a enviarla.</li>
      </ul>

      <h2 class="h2">Después de publicar</h2>
      <ul>
        <li><strong>Reportes:</strong> si una reseña rompe estas reglas, cualquier cuenta puede reportarla. La reseña sigue visible
          mientras la revisamos, para que nadie pueda bajar reseñas negativas reportándolas muchas veces.</li>
        <li><strong>Empresas:</strong> no tienen cuenta. Pueden pedirnos que revisemos una reseña con un formulario. La evaluamos con
          estas mismas reglas: <strong>una reseña nunca se retira por ser negativa</strong>.</li>
        <li>Si retiramos una reseña, quien la escribió ve el motivo y puede corregirla.</li>
      </ul>

      <nav class="see-also" aria-label="Más información">
        <a class="mb-link" routerLink="/privacidad">Política de privacidad</a>
        <a class="mb-link" routerLink="/terminos">Términos de uso</a>
      </nav>
    </article>
  `,
})
export class HowWeModerate {}
