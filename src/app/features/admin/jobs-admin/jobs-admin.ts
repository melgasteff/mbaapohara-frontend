import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCircleAlert, LucideCircleCheck } from '@lucide/angular';
import { JobsApi } from '../../../core/api/jobs-api';
import { Job } from '../../../core/models/review';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { apiErrorMessage, confirmAction } from '../api-error';
import { Notice } from '../status';

/** Catálogo de cargos que se eligen al escribir una reseña: agregar y eliminar. */
@Component({
  selector: 'app-jobs-admin',
  imports: [ReactiveFormsModule, PageState, LucideCircleAlert, LucideCircleCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  host: { class: 'admin-screen' },
  template: `
    <h1 class="h1">Cargos</h1>
    <p class="body">Los cargos que se pueden elegir al escribir una reseña.</p>

    <form class="toolbar" (submit)="add($event)" novalidate>
      <div class="mb-field add" [class.mb-field-error]="name.invalid && name.touched">
        <label for="cargo">Cargo nuevo</label>
        <input id="cargo" class="mb-input" [formControl]="name" maxlength="100" placeholder="Ej.: Cajera, Repositor, Chofer" />
      </div>
      <button type="submit" class="mb-btn mb-btn-primary" [disabled]="busy()">Agregar</button>
    </form>

    <div role="status">
      @if (notice(); as n) {
        <p class="notice body-sm" [class.notice--ok]="n.kind === 'ok'" [class.notice--error]="n.kind === 'error'">
          @if (n.kind === 'ok') { <svg lucideCircleCheck [size]="16" aria-hidden="true"></svg> } @else { <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg> }
          {{ n.text }}
        </p>
      }
    </div>

    @if (jobs.error()) {
      <app-page-state kind="error" title="No pudimos cargar los cargos." (retry)="jobs.reload()" />
    } @else if (jobs.hasValue()) {
      <ul class="rows">
        @for (job of jobs.value().data; track job.id) {
          <li class="row">
            <span class="row__title">{{ job.descripcion }}</span>
            <button type="button" class="mb-btn mb-btn-ghost mb-btn-sm" [disabled]="busy()" (click)="remove(job)">Eliminar</button>
          </li>
        }
      </ul>
    } @else {
      <app-page-state kind="loading" message="Cargando cargos…" />
    }
  `,
  styles: `
    .toolbar { align-items: flex-end; }
    .add { flex: 1; min-width: 220px; max-width: 420px; }
  `,
})
export class JobsAdmin {
  private readonly api = inject(JobsApi);
  protected readonly jobs = this.api.allResource();
  protected readonly name = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] });
  protected readonly busy = signal(false);
  protected readonly notice = signal<Notice | null>(null);

  protected add(event: Event): void {
    event.preventDefault();
    this.name.markAsTouched();
    const descripcion = this.name.value.trim();
    if (!descripcion) return;
    this.busy.set(true);
    this.notice.set(null);
    this.api.create(descripcion).subscribe({
      next: (job) => {
        this.busy.set(false);
        this.notice.set({ kind: 'ok', text: `Agregaste el cargo «${job.descripcion}».` });
        this.name.reset();
        this.jobs.reload();
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.notice.set({ kind: 'error', text: apiErrorMessage(error) });
      },
    });
  }

  protected remove(job: Job): void {
    if (!confirmAction(`¿Eliminar el cargo «${job.descripcion}»?`)) return;
    this.busy.set(true);
    this.notice.set(null);
    this.api.remove(job.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.notice.set({ kind: 'ok', text: `Eliminaste el cargo «${job.descripcion}».` });
        this.jobs.reload();
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.notice.set({ kind: 'error', text: apiErrorMessage(error) });
      },
    });
  }
}
