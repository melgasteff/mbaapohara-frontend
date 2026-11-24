import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, input, OnInit, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCircleAlert } from '@lucide/angular';
import { CATEGORIES, CATEGORY_LABELS, REJECTION_MESSAGES } from '../../../core/models/moderation';
import { ModerationCategory } from '../../../core/models/review';

export interface Rejection {
  categoria: ModerationCategory;
  motivo: string;
}

let nextId = 0;

/** Categoría y motivo para pedir un cambio o retirar una reseña. Propone el mensaje de la política, que se puede editar. */
@Component({
  selector: 'app-reject-form',
  imports: [ReactiveFormsModule, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    form { display: flex; flex-direction: column; gap: var(--space-3); padding: 18px; border-radius: var(--radio-md); background: var(--naranja-suave); }
    .mb-field { width: 100%; }
    .mb-field label { font-size: 15px; line-height: 22px; }
    select.mb-input { max-width: 360px; font-weight: 600; }
    .mb-help { color: var(--noche); }
    .mb-field-error .mb-help { color: var(--naranja-texto); font-weight: 600; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; }
  `,
  template: `
    <form class="mb-entra" (submit)="submit($event)" (keydown.escape)="cancelled.emit()" novalidate>
      <div class="mb-field">
        <label [for]="id + '-cat'">{{ categoryLabel() }}</label>
        <select #select class="mb-input" [id]="id + '-cat'" [formControl]="category">
          @for (c of categories; track c) { <option [value]="c">{{ labels[c] }}</option> }
        </select>
      </div>
      <div class="mb-field" [class.mb-field-error]="failed()">
        <label [for]="id + '-motivo'">Qué tiene que corregir (lo ve quien la escribió)</label>
        <textarea #text class="mb-input" rows="3" maxlength="500" [id]="id + '-motivo'" [formControl]="reason" [attr.aria-invalid]="failed() ? true : null" [attr.aria-describedby]="id + '-ayuda'"></textarea>
        <span class="mb-help" [id]="id + '-ayuda'">
          @if (failed()) { <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg> }
          De 10 a 500 caracteres.
        </span>
      </div>
      <div class="actions">
        <button type="submit" class="mb-btn mb-btn-peligro">{{ busy() ? 'Enviando…' : submitLabel() }}</button>
        <button type="button" class="mb-btn mb-btn-texto" (click)="cancelled.emit()">Cancelar</button>
      </div>
    </form>
  `,
})
export class RejectForm implements OnInit {
  /** Categoría propuesta. */
  readonly initial = input.required<ModerationCategory>();
  readonly categoryLabel = input('Categoría');
  readonly submitLabel = input.required<string>();
  readonly busy = input(false);
  readonly confirmed = output<Rejection>();
  readonly cancelled = output<void>();

  protected readonly id = `rechazo-${nextId++}`;
  protected readonly categories = CATEGORIES;
  protected readonly labels = CATEGORY_LABELS;
  protected readonly category = new FormControl<ModerationCategory>('TER', { nonNullable: true });
  protected readonly reason = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(500), (control) => ((control.value as string).trim().length >= 10 ? null : { corto: true })],
  });
  protected readonly failed = signal(false);
  /** Categoría anterior, para saber si el motivo es el mensaje propuesto o uno escrito a mano. */
  private last: ModerationCategory = 'TER';
  private readonly select = viewChild.required<ElementRef<HTMLSelectElement>>('select');
  private readonly text = viewChild.required<ElementRef<HTMLTextAreaElement>>('text');

  constructor() {
    this.category.valueChanges.pipe(takeUntilDestroyed()).subscribe((current) => {
      if (this.reason.value.trim() === REJECTION_MESSAGES[this.last]) this.reason.setValue(REJECTION_MESSAGES[current]);
      this.last = current;
    });
    afterNextRender(() => this.select().nativeElement.focus());
  }

  ngOnInit(): void {
    this.last = this.initial();
    this.category.setValue(this.last, { emitEvent: false });
    this.reason.setValue(REJECTION_MESSAGES[this.last]);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.failed.set(this.reason.invalid);
    if (this.reason.invalid) {
      this.text().nativeElement.focus();
      return;
    }
    this.confirmed.emit({ categoria: this.category.value, motivo: this.reason.value.trim() });
  }
}
