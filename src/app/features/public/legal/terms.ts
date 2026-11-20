import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Términos de uso (tarea 1.9). BORRADOR: revisar con el tutor antes del despliegue (4.4). */
@Component({
  selector: 'app-terms',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './legal.css',
  template: `
    <article class="page legal" aria-labelledby="titulo">
      <h1 id="titulo" class="h1">Términos de uso</h1>
      <p class="meta body-sm"><span class="mb-tag">Borrador</span> Actualizados el 19 de noviembre de 2026</p>

      <h2 class="h2">Qué es Mbaapohara</h2>
      <p>
        Una plataforma donde quienes trabajan o trabajaron en empresas y locales de Paraguay publican reseñas anónimas
        y moderadas, y cualquier persona puede consultarlas. Es un Proyecto Final de Grado de la carrera de Ingeniería en
        Informática de la FCyT-UNCA, sin fines comerciales.
      </p>

      <h2 class="h2">Quién puede usarla</h2>
      <ul>
        <li>Cualquier persona puede <strong>consultar</strong> las reseñas, sin cuenta.</li>
        <li>Para <strong>publicar</strong> necesitás una cuenta, tener <strong>18 años o más</strong> y aceptar estos términos y la
          <a class="mb-link" routerLink="/privacidad">política de privacidad</a>.</li>
        <li>Tu cuenta es personal: no la compartas ni uses la de otra persona.</li>
      </ul>

      <h2 class="h2">Qué te comprometés a publicar</h2>
      <ul>
        <li>Tu <strong>propia experiencia</strong> en una empresa y un local donde trabajás o trabajaste, contada de buena fe.</li>
        <li>Respetando las <a class="mb-link" routerLink="/como-moderamos" fragment="reglas">reglas de publicación</a>: sin nombrar
          a nadie, sin datos de contacto, sin insultos y sin publicidad.</li>
        <li>Una reseña por local. Podés editarla o eliminarla cuando quieras.</li>
      </ul>

      <h2 class="h2">Tu reseña es tu opinión</h2>
      <p>
        Las reseñas expresan la experiencia y la opinión de quien las escribe, no las de Mbaapohara ni las de la FCyT-UNCA.
        Los indicadores de cada empresa resumen esas opiniones: no son una certificación ni una auditoría.
      </p>

      <h2 class="h2">Qué puede hacer Mbaapohara</h2>
      <ul>
        <li><strong>Moderar</strong> cada reseña antes de publicarla, como se explica en
          <a class="mb-link" routerLink="/como-moderamos">cómo moderamos</a>.</li>
        <li><strong>Retirar</strong> una reseña que incumpla las reglas, explicándote el motivo.</li>
        <li><strong>Bloquear</strong> una cuenta que incumpla estas reglas de forma reiterada o grave.</li>
        <li>Corregir los datos de empresas y locales, y aprobar o rechazar las que se propongan.</li>
      </ul>
      <p>Una reseña <strong>no se retira por ser negativa</strong>, tampoco si lo pide la empresa.</p>

      <h2 class="h2">Disponibilidad</h2>
      <p>
        Mbaapohara es un proyecto académico: puede tener interrupciones, errores o cambios, y no garantizamos que esté
        siempre disponible.
      </p>

      <h2 class="h2">Cambios en estos términos</h2>
      <p>Si los cambiamos, lo avisamos en esta página con la fecha de actualización.</p>

      <nav class="see-also" aria-label="Más información">
        <a class="mb-link" routerLink="/privacidad">Política de privacidad</a>
        <a class="mb-link" routerLink="/como-moderamos">Cómo moderamos</a>
      </nav>
    </article>
  `,
})
export class Terms {}
