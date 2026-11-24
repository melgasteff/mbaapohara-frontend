import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCircleAlert, LucideX } from '@lucide/angular';
import { JobsApi } from '../../../core/api/jobs-api';
import { Job } from '../../../core/models/review';
import { keepWhileLoading } from '../../../shared/keep-while-loading';
import { InlineConfirm } from '../../../shared/ui/inline-confirm/inline-confirm';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { AdminActions } from '../admin-actions';
import { AdminNotice } from '../admin-notice/admin-notice';

/** Cargos que se eligen al escribir una reseña: los propuestos (aprobar o rechazar) y la lista (agregar o eliminar). */
@Component({
  selector: 'app-jobs-admin',
  imports: [ReactiveFormsModule, InlineConfirm, PageState, AdminNotice, LucideCircleAlert, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminActions],
  styleUrl: '../admin.css',
  host: { class: 'admin-screen' },
  template: `
    <h1 class="title" tabindex="-1">Cargos</h1>
    <app-admin-notice [notice]="actions.notice()" />

    <div class="columns">
      <section aria-labelledby="propuestos">
        <h2 id="propuestos">Propuestos desde reseñas@if (proposed(); as list) { · {{ list.total }} }</h2>
        <p class="small">Mientras no se aprueban, sus reseñas muestran «Otro cargo». Si se rechazan, siguen así.</p>
        @if (pending.error()) {
          <app-page-state kind="error" title="No pudimos cargar los cargos propuestos." (retry)="pending.reload()" />
        } @else if (proposed(); as list) {
          @if (list.total === 0) {
            <p class="small">No hay cargos propuestos pendientes.</p>
          } @else {
            <ul class="rows">
              @for (job of list.data; track job.id) {
                <li>
                  <div class="row">
                    <strong class="row__main">{{ job.descripcion }}</strong>
                    <div class="row__actions">
                      <button type="button" class="mb-btn mb-btn-primary" (click)="approve(job)">
                        {{ actions.busy() === 'aprobar-' + job.id ? 'Aprobando…' : 'Aprobar' }}<span class="visually-hidden"> {{ job.descripcion }}</span>
                      </button>
                      <button type="button" class="mb-btn mb-btn-borrar" [attr.data-accion]="'rechazar-' + job.id" (click)="actions.ask('rechazar-' + job.id)">
                        Rechazar<span class="visually-hidden"> {{ job.descripcion }}</span>
                      </button>
                    </div>
                  </div>
                  @if (actions.confirming() === 'rechazar-' + job.id) {
                    <app-inline-confirm
                      confirmLabel="Sí, rechazar"
                      [message]="'¿Rechazar el cargo «' + job.descripcion + '»? Sus reseñas van a seguir mostrando «Otro cargo».'"
                      (confirmed)="reject(job)"
                      (cancelled)="actions.cancel()"
                    />
                  }
                </li>
              }
            </ul>
          }
        }
      </section>

      <section aria-labelledby="lista">
        <h2 id="lista">Lista de cargos@if (listed(); as list) { · {{ list.total }} }</h2>
        <form class="toolbar" (submit)="add($event)" novalidate>
          <div class="mb-field add" [class.mb-field-error]="failed()">
            <label for="cargo">Cargo nuevo</label>
            <input id="cargo" class="mb-input" [formControl]="name" maxlength="100" placeholder="Ej.: Repositor, Chofer" [attr.aria-invalid]="failed() ? true : null" [attr.aria-describedby]="failed() ? 'cargo-error' : null" />
          </div>
          <button type="submit" class="mb-btn mb-btn-secondary">{{ actions.busy() === 'agregar' ? 'Agregando…' : 'Agregar' }}</button>
        </form>
        @if (failed()) {
          <p class="mb-help error" id="cargo-error"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Escribí el cargo.</p>
        }
        @if (jobs.error()) {
          <app-page-state kind="error" title="No pudimos cargar los cargos." (retry)="jobs.reload()" />
        } @else if (listed(); as list) {
          <ul class="chips">
            @for (job of list.data; track job.id) {
              <li [class.is-asking]="actions.confirming() === 'eliminar-' + job.id">
                <span class="chip">
                  {{ job.descripcion }}
                  <button type="button" [attr.aria-label]="'Eliminar ' + job.descripcion" [attr.data-accion]="'eliminar-' + job.id" (click)="actions.ask('eliminar-' + job.id)">
                    <svg lucideX [size]="16" aria-hidden="true"></svg>
                  </button>
                </span>
                @if (actions.confirming() === 'eliminar-' + job.id) {
                  <app-inline-confirm confirmLabel="Sí, eliminar" [message]="'¿Eliminar el cargo «' + job.descripcion + '»?'" (confirmed)="remove(job)" (cancelled)="actions.cancel()" />
                }
              </li>
            }
          </ul>
        } @else {
          <app-page-state kind="loading" message="Cargando cargos…" />
        }
      </section>
    </div>
  `,
  styles: `
    .columns { display: grid; gap: var(--space-6); align-items: start; }
    section { display: flex; flex-direction: column; gap: var(--space-3); min-width: 0; }
    h2 { font-size: 19px; line-height: 26px; font-weight: 700; }
    .add { flex: 1; min-width: 200px; width: auto; }
    .error { color: var(--naranja-texto); }
    .chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .chips .is-asking { flex-basis: 100%; display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-2); }
    .chip { display: inline-flex; align-items: center; min-height: 44px; padding-left: 14px; border: 1px solid var(--linea); border-radius: var(--radio-pildora); background: var(--blanco); font-size: 14px; line-height: 20px; }
    .chip button { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--naranja-texto); cursor: pointer; }
    .chip button:hover { background: var(--naranja-suave); }
    .chip button:focus-visible { outline: 2px solid var(--azul-texto); outline-offset: -2px; }
    @media (min-width: 900px) { .columns { grid-template-columns: 1fr 1fr; } }
  `,
})
export class JobsAdmin {
  private readonly api = inject(JobsApi);
  protected readonly actions = inject(AdminActions);
  protected readonly jobs = this.api.allResource();
  /** Cargos que se propusieron al escribir una reseña (3.9a). */
  protected readonly pending = this.api.adminResource('pendiente');
  protected readonly listed = keepWhileLoading(this.jobs);
  protected readonly proposed = keepWhileLoading(this.pending);
  protected readonly name = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] });
  protected readonly failed = signal(false);

  protected add(event: Event): void {
    event.preventDefault();
    const descripcion = this.name.value.trim();
    this.failed.set(!descripcion);
    if (!descripcion) {
      this.actions.focus('#cargo');
      return;
    }
    this.actions.run('agregar', this.api.create(descripcion), `Agregaste el cargo «${descripcion}».`, {
      done: () => {
        this.name.reset();
        this.jobs.reload();
      },
    });
  }

  protected approve(job: Job): void {
    this.run(`aprobar-${job.id}`, this.api.approve(job.id), `Aprobaste el cargo «${job.descripcion}»: ya está en la lista.`);
  }

  protected reject(job: Job): void {
    this.run(`rechazar-${job.id}`, this.api.reject(job.id), `Rechazaste el cargo «${job.descripcion}».`);
  }

  protected remove(job: Job): void {
    this.run(`eliminar-${job.id}`, this.api.remove(job.id), `Eliminaste el cargo «${job.descripcion}».`);
  }

  private run(key: string, action: ReturnType<JobsApi['approve']> | ReturnType<JobsApi['remove']>, success: string): void {
    this.actions.run(key, action, success, {
      done: () => {
        this.pending.reload();
        this.jobs.reload();
        this.actions.focus('h1');
      },
      failed: () => this.pending.reload(),
    });
  }
}
