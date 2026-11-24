import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { CompanySummary } from '../../../core/models/company';
import { CompanySeal } from '../company-seal/company-seal';

/** Reseñas desde las que se muestran los temas (indicadores visibles con 3 o más). */
export const MIN_REVIEWS_FOR_TOPICS = 3;
/** TODO(decision): umbral de «Muy comentada»; 50 es el valor inicial del documento de rediseño. */
export const MANY_REVIEWS = 50;

export type CompanyRowState = 'ninguna' | 'pocas' | 'con-temas' | 'muchas';

/** Qué se muestra a la derecha según la cantidad de reseñas publicadas. */
export function companyRowState(count: number): CompanyRowState {
  if (count === 0) return 'ninguna';
  if (count < MIN_REVIEWS_FOR_TOPICS) return 'pocas';
  return count >= MANY_REVIEWS ? 'muchas' : 'con-temas';
}

/** Fila de empresa del directorio: abierta, con separador. Toda la fila lleva al perfil. */
@Component({
  selector: 'app-company-row',
  imports: [DecimalPipe, RouterLink, CompanySeal, LucideArrowRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-many]': "state() === 'muchas'" },
  styleUrl: './company-row.css',
  template: `
    <app-company-seal [name]="company().nombre" [group]="company().rubro.grupo" [logoUrl]="company().logoUrl" />
    <div class="info">
      @if (state() === 'muchas') { <p class="sobretitulo">Muy comentada</p> }
      <h2 class="name"><a [routerLink]="['/empresas', company().id]">{{ company().nombre }}</a></h2>
      @if (company().rubro.nombre; as rubro) { <p class="body-sm muted">{{ rubro }}</p> }
    </div>
    @switch (state()) {
      @case ('ninguna') {
        <div class="side">
          <p class="body-sm muted">Nadie contó todavía cómo es trabajar acá.</p>
          <a class="mb-link cta" routerLink="/publicar">Contá la primera<span class="visually-hidden"> sobre {{ company().nombre }}</span></a>
        </div>
      }
      @default {
        <div class="side">
          <p class="rating">
            <svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path class="mb-star-full" d="M12 2.8l2.8 5.8 6.4.8-4.7 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8z" /></svg>
            @if (company().promedio; as average) {
              <strong>{{ average | number: '1.1-1' }}</strong><span class="visually-hidden"> de 5 estrellas</span>
              <span class="muted" aria-hidden="true">·</span>
            }
            <span class="muted">{{ count() | number }} {{ count() === 1 ? 'reseña' : 'reseñas' }}</span>
          </p>
          @if (state() === 'pocas') {
            <p class="body-sm muted">Los temas aparecen desde 3 reseñas</p>
          } @else if (company().temaPrincipal; as topic) {
            <p class="topic body-sm">
              <span class="muted">{{ topic.nombre }}</span>
              <span class="bar" aria-hidden="true"><span [style.width.%]="topic.porcentajeSi"></span></span>
              <strong>{{ topic.porcentajeSi | number: '1.0-0' }} %</strong><span class="visually-hidden"> de «Sí»</span>
            </p>
          }
        </div>
      }
    }
    <svg lucideArrowRight class="arrow" [size]="20" aria-hidden="true"></svg>
  `,
})
export class CompanyRow {
  readonly company = input.required<CompanySummary>();

  protected readonly count = computed(() => this.company().cantidadResenas);
  protected readonly state = computed(() => companyRowState(this.count()));
}
