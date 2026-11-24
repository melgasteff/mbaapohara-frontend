import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideCheck, LucidePlus, LucideX } from '@lucide/angular';
import { map } from 'rxjs';
import { ChoiceGroup } from '../../../shared/ui/choice-group/choice-group';
import { InfoPage } from '../info-page/info-page';

/** Las 7 reglas de publicación (política de moderación, sección 3). Los ejemplos son ficticios. */
const RULES: { titulo: string; si?: string; no?: string; texto?: string }[] = [
  {
    titulo: 'Contá tu propia experiencia',
    texto: 'En esa empresa y ese local.',
    si: 'En mi turno, las horas extra se pagaban con dos meses de atraso.',
    no: 'Dicen que en otra sucursal también roban.',
  },
  {
    titulo: 'Hablá de hechos sobre la empresa',
    texto: 'Pagos, horarios, contratos, trato, seguridad.',
    si: 'El aguinaldo se pagaba en cuotas y sin recibo.',
    no: 'Fui a comprar una vez y me atendieron mal.',
  },
  {
    titulo: 'No nombres a nadie',
    texto: 'Ni nombres, ni apodos, ni descripciones que apunten a una sola persona.',
    si: 'Los encargados no respetaban los descansos.',
    no: 'Juan Pérez, el encargado, es un desastre.',
  },
  {
    titulo: 'Sin datos de contacto',
    texto: 'Ni teléfonos, ni correos, ni documentos, ni enlaces.',
    si: 'Los reclamos se hacían por teléfono y nadie respondía.',
    no: 'Llamá al 0981… y preguntá por Recursos Humanos.',
  },
  {
    titulo: 'Críticas sí, insultos no',
    texto: 'Tampoco discriminación ni amenazas.',
    si: 'El trato era muy duro y nadie lo controlaba.',
    no: 'Son todos unos ladrones y unos inútiles.',
  },
  {
    titulo: 'Sin publicidad',
    texto: 'Ni textos que no hablen de tu experiencia de trabajo.',
    si: 'Lo recomiendo como primer empleo.',
    no: 'Estamos contratando: mandá tu currículum.',
  },
  { titulo: 'Una reseña por persona y local', texto: 'Podés editarla cuando quieras; cada cambio vuelve a pasar por la moderación.' },
];

const QUIZ: { frase: string; publica: boolean; porque: string }[] = [
  { frase: 'Las horas extra se pagaban tarde y había que reclamarlas cada mes.', publica: true, porque: 'cuenta un hecho de su experiencia, sin identificar a nadie.' },
  { frase: 'La señora Gómez, de Recursos Humanos, nos maltrataba.', publica: false, porque: 'nombra a una persona. Podría decir «En Recursos Humanos nos trataban mal».' },
  { frase: 'Si querés saber más, llamá al 0981 123 456.', publica: false, porque: 'tiene un dato de contacto. La experiencia hay que contarla en la reseña.' },
];

/** Términos de uso (tarea 1.9). BORRADOR: revisar con el tutor antes del despliegue (4.4). */
@Component({
  selector: 'app-terms',
  imports: [ReactiveFormsModule, RouterLink, InfoPage, ChoiceGroup, LucideCheck, LucidePlus, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './info-content.css',
  styles: `
    ol { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 20px; }
    ol > li { display: flex; flex-direction: column; gap: 10px; padding-bottom: 20px; border-bottom: 1px solid var(--linea); }
    .rule { display: flex; gap: 14px; align-items: baseline; }
    .rule span { font-size: 15px; font-weight: 700; color: var(--noche-suave); }
    .rule h3 { font-size: 20px; line-height: 26px; }
    .example { padding: 14px var(--space-4); border-top: 3px solid var(--azul-texto); background: var(--blanco); font-size: 15px; line-height: 22px; }
    .example strong { display: flex; align-items: center; gap: 6px; color: var(--azul-texto); }
    .example--no { border-top-color: var(--naranja-texto); }
    .example--no strong { color: var(--naranja-texto); }
    .quiz { display: flex; flex-direction: column; gap: var(--space-3); padding: 20px; border-radius: var(--radio-md); background: var(--blanco); }
    .quiz > p:first-child { font-size: 17px; line-height: 25px; }
    .verdict { font-size: 15px; line-height: 22px; }
    summary {
      display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: 18px 20px; border: 1.5px solid var(--noche); border-radius: var(--radio-md);
      background: var(--blanco); font-size: 18px; line-height: 26px; font-weight: 700; cursor: pointer; list-style: none;
    }
    summary::-webkit-details-marker { display: none; }
    summary:focus-visible { outline: 2px solid var(--azul-texto); outline-offset: 2px; }
    summary svg { flex: none; transition: transform .15s ease; }
    details[open] summary svg { transform: rotate(45deg); }
    .full { display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-3); padding: var(--space-5); border-radius: var(--radio-md); background: var(--blanco); font-size: 15px; line-height: 24px; }
    .full h3 { margin-bottom: var(--space-1); font-size: 16px; line-height: 24px; }
    .full ul { padding-left: 20px; }
    @media (prefers-reduced-motion: reduce) { summary svg { transition: none; } }
  `,
  template: `
    <app-info-page page="terminos">
      <section id="reglas" tabindex="-1" aria-labelledby="reglas-titulo">
        <h2 id="reglas-titulo" class="info-h2">Las reglas, con ejemplos</h2>
        <p>Las aceptás antes de enviar cada reseña.</p>
        <ol>
          @for (rule of rules; track rule.titulo) {
            <li>
              <div class="rule"><span aria-hidden="true">0{{ $index + 1 }}</span><h3>{{ rule.titulo }}</h3></div>
              @if (rule.texto) { <p>{{ rule.texto }}</p> }
              @if (rule.si) {
                <div class="cards cards--2">
                  <div class="example"><strong><svg lucideCheck [size]="16" aria-hidden="true"></svg>Así sí</strong>«{{ rule.si }}»</div>
                  <div class="example example--no"><strong><svg lucideX [size]="16" aria-hidden="true"></svg>Así no</strong>«{{ rule.no }}»</div>
                </div>
              }
            </li>
          }
        </ol>
      </section>

      <section id="probar" tabindex="-1" aria-labelledby="probar-titulo">
        <h2 id="probar-titulo" class="info-h2">¿Se publicaría?</h2>
        <p>Tres frases de ejemplo. Decidí y fijate si coincidimos.</p>
        @for (item of quiz; track item.frase) {
          <div class="quiz">
            <p [id]="'frase-' + $index">«{{ item.frase }}»</p>
            <app-choice-group [labelledBy]="'frase-' + $index" [options]="answers" [formControl]="controls[$index]" />
            <p class="verdict" role="status">
              @if (verdict($index); as text) { <strong>{{ text }}</strong> {{ item.publica ? 'Se publica: ' : 'No se publica: ' }}{{ item.porque }} }
            </p>
          </div>
        }
        <p class="small">Es una guía: cada reseña se revisa completa, y lo dudoso lo lee una persona.</p>
      </section>

      <section id="completo" tabindex="-1" aria-label="Términos completos">
        <details>
          <summary>Leer los términos completos<svg lucidePlus [size]="20" aria-hidden="true"></svg></summary>
          <div class="full">
            <div>
              <h3>1. Qué es Mbaapohara</h3>
              <p>
                Una plataforma donde quienes trabajan o trabajaron en empresas y locales de Paraguay publican reseñas anónimas y moderadas, y cualquier
                persona puede consultarlas. Es un Proyecto Final de Grado de la carrera de Ingeniería en Informática de la FCyT-UNCA, sin fines
                comerciales.
              </p>
            </div>
            <div>
              <h3>2. Quién puede usarla</h3>
              <ul>
                <li>Cualquier persona puede consultar las reseñas, sin cuenta.</li>
                <li>Para publicar necesitás una cuenta, tener 18 años o más y aceptar estos términos y la <a routerLink="/privacidad">política de privacidad</a>.</li>
                <li>Tu cuenta es personal: no la compartas ni uses la de otra persona.</li>
              </ul>
            </div>
            <div>
              <h3>3. Lo que publicás</h3>
              <ul>
                <li>Tu propia experiencia en una empresa y un local donde trabajás o trabajaste, contada de buena fe y respetando las reglas.</li>
                <li>Una reseña por local. Podés editarla o eliminarla cuando quieras.</li>
              </ul>
            </div>
            <div>
              <h3>4. Tu reseña es tu opinión</h3>
              <p>
                Las reseñas expresan la experiencia y la opinión de quien las escribe, no las de Mbaapohara ni las de la FCyT-UNCA. Los indicadores de cada
                empresa resumen esas opiniones: no son una certificación ni una auditoría. Más en
                <a routerLink="/responsabilidad">responsabilidad por las reseñas</a>.
              </p>
            </div>
            <div>
              <h3>5. Moderación y retiro de contenido</h3>
              <ul>
                <li>Moderamos cada reseña antes de publicarla, como se explica en <a routerLink="/como-moderamos">cómo moderamos</a>.</li>
                <li>Podemos retirar una reseña que incumpla las reglas, explicándote el motivo.</li>
                <li>Podemos bloquear una cuenta que incumpla estas reglas de forma reiterada o grave.</li>
                <li>Podemos corregir los datos de empresas y locales, y aprobar o rechazar los que se propongan.</li>
                <li>Una reseña no se retira por ser negativa, tampoco si lo pide la empresa.</li>
              </ul>
            </div>
            <div>
              <h3>6. Disponibilidad</h3>
              <p>Es un proyecto académico: puede tener interrupciones, errores o cambios, y no garantizamos que esté siempre disponible.</p>
            </div>
            <div>
              <h3>7. Cambios en estos términos</h3>
              <p>Si los cambiamos, actualizamos la fecha que está arriba.</p>
            </div>
          </div>
        </details>
      </section>
    </app-info-page>
  `,
})
export class Terms {
  protected readonly rules = RULES;
  protected readonly quiz = QUIZ;
  protected readonly answers = [
    { valor: true, etiqueta: 'Se publica' },
    { valor: false, etiqueta: 'No se publica' },
  ];
  protected readonly controls = QUIZ.map(() => new FormControl<boolean | null>(null));
  private readonly group = new FormGroup(Object.fromEntries(this.controls.map((control, i) => [i, control])));
  private readonly values = toSignal(this.group.valueChanges.pipe(map(() => this.controls.map((control) => control.value))), {
    initialValue: this.controls.map(() => null as boolean | null),
  });

  /** '' mientras no se eligió. */
  protected verdict(index: number): string {
    const value = this.values()[index];
    if (value === null) return '';
    return value === QUIZ[index].publica ? 'Coincidimos.' : 'Esta vez no coincidimos.';
  }
}
