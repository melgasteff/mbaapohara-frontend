import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleAlert } from '@lucide/angular';
import { PublishResult as Result, ReviewDraft } from '../../../../core/models/review';
import { Tag } from '../../../../shared/ui/tag/tag';

/**
 * Resultado del envío según la política de moderación (sección 7): publicada, en revisión o rechazada con lo que
 * hay que corregir. Lo decide la moderación del backend (tareas 2.3 y 3.3)..
 */
@Component({
  selector: 'app-publish-result',
  imports: [RouterLink, Tag, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; max-width: 760px; margin: 0 auto; }
    .card { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: var(--space-6) var(--space-4); border-radius: var(--radio-md); background: var(--blanco); text-align: center; }
    .card--fix { align-items: flex-start; gap: var(--space-4); text-align: left; }
    h1, p { margin: 0; }
    h1:focus { outline: none; }
    .lead { max-width: 56ch; font-size: 17px; line-height: 26px; color: var(--noche-suave); }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-3); margin-top: var(--space-2); }
    .mb-btn { height: auto; min-height: 48px; padding: var(--space-2) 20px; white-space: normal; }
    .reason {
      display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: var(--space-3); width: 100%; box-sizing: border-box; padding: var(--space-4) 0;
      border-top: 1px solid var(--linea); border-bottom: 1px solid var(--linea); font-size: 16px; line-height: 24px; font-weight: 600;
    }
    .reason svg { color: var(--naranja-texto); }
    @media (min-width: 760px) { .card { padding: 40px; } }
  `,
  template: `
    @switch (result().estado) {
      @case ('publicada') {
        <div class="card mb-entra">
          <img src="/marca/iconos/01-jarra-de-terere.svg" alt="" width="120" height="120" />
          <app-tag kind="publicada">Publicada</app-tag>
          <h1 class="h1" tabindex="-1">Gracias por contar tu experiencia</h1>
          <p class="lead">Tu reseña ya se ve en el perfil de {{ draft().empresa.nombre }}. Lo que contaste ayuda a quien busca trabajo ahí.</p>
          <div class="actions">
            <a class="mb-btn mb-btn-primary" [routerLink]="['/empresas', draft().empresa.id]" [queryParams]="{ local: draft().local.id }" fragment="resenas">Ver mi reseña en el perfil</a>
            <a class="mb-btn mb-btn-secondary" routerLink="/mis-resenas">Ir a mis reseñas</a>
          </div>
        </div>
      }
      @case ('en_revision') {
        <div class="card mb-entra">
          <img src="/marca/iconos/02-guampa.svg" alt="" width="120" height="120" />
          <app-tag kind="en_revision">En revisión</app-tag>
          <h1 class="h1" tabindex="-1">Recibimos tu reseña</h1>
          <p class="lead">{{ reviewMessage() }}</p>
          <p class="lead">
            Una persona del equipo la va a leer sin saber quién la escribió. Es un paso normal y no significa que hiciste algo mal. Podés
            ver el estado en «Mis reseñas».
          </p>
          <div class="actions">
            <a class="mb-btn mb-btn-primary" routerLink="/mis-resenas">Ir a mis reseñas</a>
            <a class="mb-btn mb-btn-secondary" routerLink="/como-moderamos">Cómo moderamos</a>
          </div>
        </div>
      }
      @default {
        <div class="card card--fix mb-entra">
          <app-tag kind="rechazada">Necesita un cambio</app-tag>
          <h1 class="h1" tabindex="-1">{{ editing() ? 'Tus cambios no se publicaron todavía' : 'Tu reseña no se publicó todavía' }}</h1>
          <p class="lead">Encontramos algo que hay que corregir. Lo demás quedó guardado: solo cambiá esto y volvé a enviarla.</p>
          <p class="reason"><svg lucideCircleAlert [size]="22" aria-hidden="true"></svg><span>{{ result().motivo }}</span></p>
          <button type="button" class="mb-btn mb-btn-primary" (click)="edit.emit()">Corregir la reseña</button>
        </div>
      }
    }
  `,
})
export class PublishResult {
  readonly draft = input.required<ReviewDraft>();
  readonly result = input.required<Result>();
  readonly editing = input(false);
  /** Volver al paso 4 con lo escrito, para corregir una reseña rechazada. */
  readonly edit = output<void>();

  protected readonly reviewMessage = computed(() => this.result().motivo || 'Tu reseña está en revisión.');
}
