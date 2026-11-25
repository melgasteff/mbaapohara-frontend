import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCheck, LucideX } from '@lucide/angular';
import { ChoiceGroup } from '../../../shared/ui/choice-group/choice-group';
import { InfoPage } from '../info-page/info-page';

/** Contacto para consultas y derechos sobre los datos (dato público elegido por la autora del proyecto). */
const CONTACT = 'melgasteff@gmail.com';

type Viewer = 'visitante' | 'empresa' | 'moderacion' | 'vos';
const EVERYONE: Viewer[] = ['visitante', 'empresa', 'moderacion', 'vos'];

const NOTES: Record<Viewer, string> = {
  visitante: 'Quien visita el sitio ve la reseña sin ningún dato tuyo.',
  empresa: 'La empresa ve lo mismo que cualquier visitante. No recibe tu correo.',
  moderacion: 'La moderación ve cuándo se envió, para ordenar la fila de revisión, pero nunca quién la escribió.',
  vos: 'Desde tu cuenta ves todo lo tuyo y podés editarlo o borrarlo.',
};

/** Datos de ejemplo, ficticios. */
const FIELDS: { nombre: string; valor: string; ve: Viewer[]; oculto?: string }[] = [
  { nombre: 'Tu nombre', valor: '', ve: [], oculto: 'No lo pedimos' },
  { nombre: 'Tu correo', valor: 'persona@ejemplo.com', ve: ['vos'] },
  { nombre: 'Calificación, textos y respuestas', valor: '4 estrellas · «Buen trato de los encargados…»', ve: EVERYONE },
  { nombre: 'Local, cargo y último año', valor: 'Centro, Asunción · Atención al cliente · hasta 2025', ve: EVERYONE },
  { nombre: 'Contrato y modalidad', valor: 'Por tiempo indefinido · Presencial', ve: EVERYONE },
  { nombre: 'Mes de publicación', valor: 'Noviembre de 2026', ve: EVERYONE },
  { nombre: 'Fecha y hora de envío', valor: '23/11/2026, 18:42', ve: ['moderacion', 'vos'] },
];

/**
 * Privacidad (tarea 1.9). Describe lo que el sistema hace hoy: datos mínimos (Ley 7593/2025), borrado de la cuenta con sus
 * reseñas (D9) y envío de solo el texto al modelo de lenguaje (D4). BORRADOR: la revisa el tutor.
 */
@Component({
  selector: 'app-privacy',
  imports: [ReactiveFormsModule, RouterLink, InfoPage, ChoiceGroup, LucideArrowRight, LucideCheck, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './info-content.css',
  styles: `
    .as { display: flex; flex-direction: column; gap: var(--space-2); }
    .as p { font-size: 15px; line-height: 22px; font-weight: 600; }
    .sample { padding: 22px; border: 1px solid var(--linea); border-radius: var(--radio-resena); background: var(--blanco); }
    .sample dl > div { display: grid; grid-template-columns: minmax(0, 1fr) 28px; gap: 0 var(--space-4); align-items: center; padding: var(--space-3) 0; border-bottom: 1px solid var(--linea-suave); font-size: 15px; line-height: 22px; }
    .sample dt { grid-column: 1; color: var(--noche-suave); }
    .sample dd { grid-column: 1; font-weight: 600; overflow-wrap: anywhere; }
    .sample .is-hidden { font-weight: 400; color: var(--noche-suave); }
    .sample .mark { grid-column: 2; grid-row: 1 / span 2; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: var(--azul-suave); color: var(--azul-texto); }
    .sample .mark--no { background: var(--naranja-suave); color: var(--naranja-texto); }
    .sample > p { margin-top: 14px; }
    @media (min-width: 760px) {
      .sample dl > div { grid-template-columns: 200px minmax(0, 1fr) 28px; }
      .sample dd { grid-column: 2; }
      .sample .mark { grid-column: 3; grid-row: 1; }
    }
  `,
  template: `
    <app-info-page page="privacidad">
      <section id="quien" tabindex="-1" aria-labelledby="quien-titulo">
        <h2 id="quien-titulo" class="info-h2">Quién ve qué</h2>
        <p>Elegí quién mira y fijate qué partes de una reseña publicada le aparecen.</p>
        <div class="as">
          <p id="ver-como">Ver como:</p>
          <app-choice-group labelledBy="ver-como" [options]="viewers" [formControl]="viewer" />
        </div>
        <div class="sample">
          <dl>
            @for (field of fields(); track field.nombre) {
              <div>
                <dt>{{ field.nombre }}</dt>
                <dd [class.is-hidden]="!field.visible">{{ field.texto }}</dd>
                <dd class="mark" [class.mark--no]="!field.visible">
                  @if (field.visible) {
                    <svg lucideCheck [size]="16" aria-hidden="true"></svg><span class="visually-hidden">Lo ve</span>
                  } @else {
                    <svg lucideX [size]="16" aria-hidden="true"></svg><span class="visually-hidden">No lo ve</span>
                  }
                </dd>
              </div>
            }
          </dl>
          <p class="small" role="status">{{ note() }}</p>
        </div>
        <p>
          Los porcentajes y la distribución de una empresa se muestran recién con 3 reseñas o más, para que no se pueda deducir quién respondió
          qué.
        </p>
      </section>

      <section id="datos" tabindex="-1" aria-labelledby="datos-titulo">
        <h2 id="datos-titulo" class="info-h2">Qué datos pedimos y para qué</h2>
        <dl class="rows">
          <div><dt>Correo</dt><dd>Para que puedas ingresar y para que haya una sola reseña por persona y local. No enviamos correos ni publicidad.</dd></div>
          <div><dt>Contraseña</dt><dd>Para que solo vos puedas ingresar. Se guarda cifrada, nunca en texto legible.</dd></div>
          <div><dt>Rol y estado de la cuenta</dt><dd>Para saber si es común o de administración, y si está bloqueada.</dd></div>
          <div><dt>Aceptación de los términos</dt><dd>La fecha, para dejar constancia de tu consentimiento.</dd></div>
          <div>
            <dt>Tu reseña</dt>
            <dd>
              Local, cargo, situación, último año, contrato, modalidad, respuestas, calificación y textos. Para publicarla y calcular los resúmenes
              de la empresa, sin datos tuyos.
            </dd>
          </div>
          <div><dt>Tus reportes</dt><dd>La categoría y el comentario, para revisar la reseña reportada. Quien la escribió y la empresa no ven que reportaste.</dd></div>
          <div>
            <dt>Si escribís por una empresa</dt>
            <dd>Tu nombre, tu correo y tu mensaje, para responderte. El nombre y el correo se borran al responder.</dd>
          </div>
          <div>
            <dt>En tu navegador</dt>
            <dd>
              Tu sesión, mientras la pestaña está abierta, y el borrador de una reseña sin enviar, que no llega a nuestros servidores. Sin cookies de
              seguimiento.
            </dd>
          </div>
          <div><dt>Lo que no pedimos</dt><dd>Tu nombre, tu documento, tu teléfono, tu fecha de nacimiento ni tu dirección.</dd></div>
        </dl>
      </section>

      <section id="compartimos" tabindex="-1" aria-labelledby="compartimos-titulo">
        <h2 id="compartimos-titulo" class="info-h2">Con quién compartimos datos</h2>
        <dl class="rows">
          <div>
            <dt>Revisión automática</dt>
            <dd>
              «Lo bueno» y «A mejorar» se envían a un modelo de lenguaje (Claude, de Anthropic, a través de su API). Solo el texto: nunca tu correo,
              tu cuenta, la empresa ni el local.
            </dd>
          </div>
          <div>
            <dt>Alojamiento</dt>
            <dd>
              Los datos se guardan fuera de Paraguay. La base está en Neon y la API en Render, en Virginia (Estados Unidos). Las páginas se publican
              con Vercel. Son empresas que prestan ese servicio y pueden procesar datos técnicos de la conexión, como tu dirección IP.
            </dd>
          </div>
          <div><dt>Nadie más</dt><dd>No vendemos ni cedemos tus datos, tampoco a las empresas reseñadas.</dd></div>
        </dl>
      </section>

      <section id="tiempo" tabindex="-1" aria-labelledby="tiempo-titulo">
        <h2 id="tiempo-titulo" class="info-h2">Cuánto tiempo los guardamos</h2>
        <dl class="rows">
          <div><dt>Mientras tengas cuenta</dt><dd>Tus datos, tus reseñas y tus reportes se guardan hasta que los borrás vos o eliminás la cuenta.</dd></div>
          <div><dt>Al borrar una reseña</dt><dd>Se borra en el momento, con todas sus versiones y respuestas.</dd></div>
          <div>
            <dt>Lo que queda</dt>
            <dd>
              Un registro de cada decisión de moderación, sin tu cuenta ni la reseña: el resultado, el motivo, los puntajes, una huella del texto que no
              permite leerlo y, si lo hubo, una frase breve del modelo para quien modera. Si una empresa pidió revisarla, también quedan su mensaje
              y nuestra respuesta.
            </dd>
          </div>
          <div>
            <dt>Copias de seguridad</dt>
            <dd>
              No hacemos copias propias: este es un proyecto académico y no podemos garantizar recuperar tus datos si se pierden. El servicio de la
              base conserva por hasta 6 horas el historial de cambios, así que algo que borraste puede quedar ahí ese tiempo.
            </dd>
          </div>
        </dl>
      </section>

      <section id="derechos-datos" tabindex="-1" aria-labelledby="derechos-titulo">
        <h2 id="derechos-titulo" class="info-h2">Lo que podés hacer con tus datos</h2>
        <div class="cards cards--2">
          <a class="card card--link" routerLink="/mi-cuenta">
            <h3>Descargar tus datos</h3>
            <span>Desde «Mi cuenta», en un archivo con tu cuenta, tus reseñas y tus reportes.</span>
            <strong>Ir a Mi cuenta<svg lucideArrowRight [size]="16" aria-hidden="true"></svg></strong>
          </a>
          <a class="card card--link" routerLink="/mi-cuenta">
            <h3>Eliminar tu cuenta</h3>
            <span>Se borran tu correo, tu contraseña, tus reportes y también todas tus reseñas, en el momento.</span>
            <strong>Ir a Mi cuenta<svg lucideArrowRight [size]="16" aria-hidden="true"></svg></strong>
          </a>
        </div>
        <!-- TODO(decision): referencia legal y plazos de respuesta; los revisa el tutor. -->
        <p>
          También podés escribirnos a <a [href]="'mailto:' + contact">{{ contact }}</a> para corregir datos o hacer una consulta. Estos derechos se
          basan en la Ley N.º 7593/2025 de protección de datos personales.
        </p>
      </section>

      <section id="proteccion" tabindex="-1" aria-labelledby="proteccion-titulo">
        <h2 id="proteccion-titulo" class="info-h2">Cómo los protegemos</h2>
        <div class="cards cards--3">
          <div class="card"><h3>Contraseñas</h3><span>Se guardan cifradas y nunca quedan en ningún registro.</span></div>
          <div class="card"><h3>Registros técnicos</h3><span>No guardan contraseñas, datos de ingreso ni datos personales.</span></div>
          <div class="card"><h3>Ingreso</h3><span>Limita los intentos, para frenar a quien quiera adivinar contraseñas.</span></div>
        </div>
      </section>

      <section id="responsable" tabindex="-1" aria-labelledby="responsable-titulo">
        <h2 id="responsable-titulo" class="info-h2">Quién es responsable</h2>
        <p>
          Mbaapohara es un Proyecto Final de Grado de la carrera de Ingeniería en Informática de la Facultad de Ciencias y Tecnologías de la
          Universidad Nacional de Caaguazú (FCyT-UNCA). Para consultas sobre tus datos, escribinos a
          <a [href]="'mailto:' + contact">{{ contact }}</a>.
        </p>
      </section>

      <section id="edad-cambios" tabindex="-1" aria-labelledby="edad-titulo">
        <h2 id="edad-titulo" class="info-h2">Edad y cambios</h2>
        <dl class="rows">
          <div><dt>Edad</dt><dd>Para crear una cuenta tenés que tener 18 años o más. No pedimos tu fecha de nacimiento: lo declarás al registrarte.</dd></div>
          <div><dt>Cambios</dt><dd>Si cambiamos esta página, actualizamos la fecha que está arriba.</dd></div>
        </dl>
      </section>
    </app-info-page>
  `,
})
export class Privacy {
  protected readonly contact = CONTACT;
  protected readonly viewers: { valor: Viewer; etiqueta: string }[] = [
    { valor: 'visitante', etiqueta: 'Visitante' },
    { valor: 'empresa', etiqueta: 'La empresa' },
    { valor: 'moderacion', etiqueta: 'Moderación' },
    { valor: 'vos', etiqueta: 'Vos' },
  ];
  protected readonly viewer = new FormControl<Viewer>('visitante', { nonNullable: true });
  private readonly current = toSignal(this.viewer.valueChanges, { initialValue: this.viewer.value });
  protected readonly note = computed(() => NOTES[this.current()]);
  protected readonly fields = computed(() =>
    FIELDS.map(({ nombre, valor, ve, oculto }) => {
      const visible = ve.includes(this.current());
      return { nombre, visible, texto: visible ? valor : (oculto ?? 'Oculto') };
    }),
  );
}
