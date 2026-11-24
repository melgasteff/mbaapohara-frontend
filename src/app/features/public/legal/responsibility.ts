import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBuilding2, LucideShieldCheck, LucideUserRound } from '@lucide/angular';
import { InfoPage } from '../info-page/info-page';

/** Responsabilidad por las reseñas (rediseño, fase 6). Sale de la política de moderación, sección 8. BORRADOR: la revisa el tutor. */
@Component({
  selector: 'app-responsibility',
  imports: [RouterLink, InfoPage, LucideBuilding2, LucideShieldCheck, LucideUserRound],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './info-content.css',
  styles: `
    .icon { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: var(--azul-suave); color: var(--azul-texto); }
    ol { list-style: none; padding: 0; }
    ol li { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: var(--space-4); padding-bottom: 18px; }
    .number { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; width: 44px; height: 44px; border: 2px solid var(--noche); border-radius: 50%; background: var(--blanco); font-size: 18px; font-weight: 700; }
    li:last-child .number { border-color: var(--azul-texto); background: var(--azul-texto); color: var(--blanco); }
    .step { display: flex; flex-direction: column; gap: var(--space-1); padding-top: var(--space-2); font-size: 16px; line-height: 24px; color: var(--noche-suave); }
    .step h3 { font-size: 18px; line-height: 24px; color: var(--noche); }
    .mb-btn { align-self: flex-start; height: auto; min-height: 48px; padding: var(--space-2) 20px; white-space: normal; }
  `,
  template: `
    <app-info-page page="responsabilidad">
      <section id="quien-responde" tabindex="-1" aria-labelledby="quien-responde-titulo">
        <h2 id="quien-responde-titulo" class="info-h2">Quién responde por qué</h2>
        <div class="cards cards--3">
          <div class="card">
            <span class="icon"><svg lucideUserRound [size]="22" aria-hidden="true"></svg></span>
            <h3>Quien escribe</h3>
            <span>Responde por lo que cuenta y declara que es su experiencia real.</span>
          </div>
          <div class="card">
            <span class="icon"><svg lucideShieldCheck [size]="22" aria-hidden="true"></svg></span>
            <h3>Mbaapohara</h3>
            <span>Revisa cada reseña antes de publicarla y atiende reportes y pedidos de revisión.</span>
          </div>
          <div class="card">
            <span class="icon"><svg lucideBuilding2 [size]="22" aria-hidden="true"></svg></span>
            <h3>La empresa</h3>
            <span>No tiene cuenta, pero puede pedir que revisemos una reseña o que corrijamos sus datos.</span>
          </div>
        </div>
      </section>

      <section id="pedido" tabindex="-1" aria-labelledby="pedido-titulo">
        <h2 id="pedido-titulo" class="info-h2">Si sos de la empresa: cómo pedir una revisión</h2>
        <ol>
          @for (step of steps; track step.titulo) {
            <li>
              <span class="number" aria-hidden="true">{{ $index + 1 }}</span>
              <div class="step"><h3>{{ step.titulo }}</h3><p>{{ step.texto }}</p></div>
            </li>
          }
        </ol>
        <a class="mb-btn mb-btn-primary" routerLink="/empresas">Buscar la empresa y la reseña</a>
      </section>

      <section id="limites" tabindex="-1" aria-labelledby="limites-titulo">
        <h2 id="limites-titulo" class="info-h2">Lo que podemos hacer y lo que no</h2>
        <div class="cards cards--2">
          <div class="card card--yes">
            <h3>Podemos</h3>
            <ul>
              <li>Retirar una reseña que no cumple las reglas</li>
              <li>Explicar por qué se mantiene una reseña</li>
              <li>Corregir los datos de la empresa y sus locales</li>
            </ul>
          </div>
          <div class="card card--no">
            <h3>No podemos</h3>
            <ul>
              <li>Decir quién escribió una reseña</li>
              <li>Retirarla solo porque a la empresa no le gusta</li>
            </ul>
          </div>
        </div>
      </section>
    </app-info-page>
  `,
})
export class Responsibility {
  protected readonly steps = [
    { titulo: 'Buscá la reseña', texto: 'En el perfil de la empresa, tocá «¿Sos de la empresa? Pedí una revisión» en la reseña que te preocupa.' },
    { titulo: 'Contanos qué pasa', texto: 'Completá el formulario con tu nombre, tu correo y el motivo: un dato falso, un nombre propio, información privada.' },
    { titulo: 'La leemos', texto: 'Revisamos la reseña con las mismas reglas con las que se publicó.' },
    { titulo: 'Te respondemos por correo', texto: 'Te contamos si la reseña se mantiene o se retira, y por qué.' },
  ];
}
