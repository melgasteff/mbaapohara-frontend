import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TabItem, Tabs } from '../../../shared/ui/tabs/tabs';
import { InfoPage } from '../info-page/info-page';

type Stage = 'enviada' | 'automatica' | 'humana' | 'publicada' | 'cambio';

const STAGES: Record<Stage, { titulo: string; texto: string; nota?: string }> = {
  enviada: { titulo: 'Enviada', texto: 'Al tocar «Enviar», la reseña queda guardada. Todavía no la ve nadie más que vos.' },
  automatica: {
    titulo: 'Revisión automática',
    texto:
      'Primero, unas reglas buscan datos de contacto, palabras ofensivas y textos repetidos. Después, un modelo de lenguaje analiza el texto: solo recibe lo que escribiste, nunca tu correo, tu cuenta, la empresa ni el local.',
    nota: 'Si el resultado es claro, se publica o te pedimos un cambio. Si hay dudas, si parece acusar de un delito a una persona o si el servicio falla, la lee una persona.',
  },
  humana: {
    titulo: 'Revisión humana',
    texto: 'Una persona del equipo lee la reseña y decide si se publica o si hay que corregir algo. El objetivo es resolverla en 48 horas.',
    nota: 'Ve el contenido de la reseña y por qué quedó en revisión, nunca quién la escribió.',
  },
  publicada: { titulo: 'Publicada', texto: 'Aparece en el perfil de la empresa, con el mes de publicación y sin tu nombre.' },
  cambio: {
    titulo: 'Necesita un cambio',
    texto: 'Te decimos qué corregir. Lo demás queda guardado y la volvés a enviar. Solo vos la ves.',
    nota: 'Está en «Mis reseñas».',
  },
};

/**
 * «Cómo moderamos» (tarea 1.9). Resume para el público la política de moderación del backend
 * (mbaapohara-backend/docs/politica-moderacion.md): si la política cambia, esta página también.
 */
@Component({
  selector: 'app-how-we-moderate',
  imports: [RouterLink, InfoPage, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './info-content.css',
  styles: `
    .stage { display: flex; flex-direction: column; gap: var(--space-2); padding: 24px 26px; border-radius: var(--radio-md); background: var(--blanco); font-size: 16px; line-height: 25px; }
    .stage h3 { font-size: 21px; line-height: 28px; }
  `,
  template: `
    <app-info-page page="moderacion">
      <section id="recorrido" tabindex="-1" aria-labelledby="recorrido-titulo">
        <h2 id="recorrido-titulo" class="info-h2">El recorrido de una reseña</h2>
        <p>Tocá cada etapa para ver qué pasa en ella.</p>
        <app-tabs look="etapas" label="Etapas" panelId="etapa" [tabs]="tabs" [(value)]="stage" />
        <div class="stage" id="etapa" role="tabpanel" tabindex="0" [attr.aria-labelledby]="'etapa-' + stage()">
          <h3>{{ detail().titulo }}</h3>
          <p>{{ detail().texto }}</p>
          @if (detail().nota; as note) { <p class="small">{{ note }}</p> }
        </div>
      </section>

      <section id="revisamos" tabindex="-1" aria-labelledby="revisamos-titulo">
        <h2 id="revisamos-titulo" class="info-h2">Qué revisamos y qué no</h2>
        <p>La crítica a la empresa sobre hechos laborales siempre se publica, aunque sea dura. Moderamos para proteger a las personas y tu anonimato.</p>
        <div class="cards cards--2">
          <div class="card card--yes">
            <h3>Revisamos que no haya</h3>
            <ul>
              <li>Teléfonos, correos, documentos o enlaces</li>
              <li>Nombres, apodos o descripciones que apunten a una persona</li>
              <li>Acusaciones de delitos contra una persona</li>
              <li>Insultos, amenazas o discriminación</li>
              <li>Publicidad o textos que no hablan del trabajo</li>
            </ul>
          </div>
          <div class="card card--no">
            <h3>Nunca hacemos esto</h3>
            <ul>
              <li>Retirar una reseña solo porque es negativa</li>
              <li>Cambiar tu texto: si algo se corrige, te lo pedimos</li>
              <li>Mostrar quién escribió, ni siquiera a la moderación</li>
            </ul>
          </div>
        </div>
        <p>Las reglas completas, con ejemplos, están en los <a routerLink="/terminos" fragment="reglas">términos de uso</a>.</p>
      </section>

      <section id="reportes" tabindex="-1" aria-labelledby="reportes-titulo">
        <h2 id="reportes-titulo" class="info-h2">Si ves algo que no debería estar</h2>
        <p>
          Con tu cuenta podés tocar «Reportar» en una reseña publicada. Juntamos los reportes de cada reseña y decidimos si se mantiene o se retira
          según las mismas reglas con las que se revisó. Mientras tanto sigue visible, para que nadie pueda bajar reseñas reportándolas muchas
          veces.
        </p>
        <p>Si sos de la empresa, no necesitás cuenta: mirá <a routerLink="/responsabilidad" fragment="pedido">cómo pedir una revisión</a>.</p>
      </section>
    </app-info-page>
  `,
})
export class HowWeModerate {
  protected readonly tabs: TabItem<Stage>[] = (Object.keys(STAGES) as Stage[]).map((valor, i) => ({
    valor,
    etiqueta: STAGES[valor].titulo,
    urgente: valor === 'cambio',
    // Al final del recorrido se llega a una de las dos últimas.
    separador: i < 3 ? '→' : i === 3 ? 'o' : undefined,
  }));
  protected readonly stage = signal<Stage>('automatica');
  protected readonly detail = computed(() => STAGES[this.stage()]);
}
