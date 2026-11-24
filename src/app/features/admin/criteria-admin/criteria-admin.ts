import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { LucideCircleAlert, LucideCircleCheck, LucideTriangleAlert } from '@lucide/angular';
import { CriteriaApi } from '../../../core/api/criteria-api';
import { AdminCriteriaCategory, AdminCriterion, CriteriaChange } from '../../../core/models/criteria';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { apiErrorMessage, confirmAction } from '../api-error';
import { Notice } from '../status';

/** Código estable: letras sin tildes, números y guion bajo. La API lo pasa a mayúsculas. */
const CODE = /^[A-Za-z0-9_]{2,30}$/;

/** Lo que se está editando: una categoría o un ítem, de a uno por vez. */
type Editing = { kind: 'category'; id: number } | { kind: 'item'; id: number; respuestas: number };

/**
 * Criterios de la reseña (tarea 3.8): agregar categorías e ítems, corregir su texto y su orden, y desactivarlos.
 * No se borran: así las respuestas guardadas siguen apuntando a su criterio.
 */
@Component({
  selector: 'app-criteria-admin',
  imports: [ReactiveFormsModule, PageState, LucideCircleAlert, LucideCircleCheck, LucideTriangleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  host: { class: 'admin-screen' },
  templateUrl: './criteria-admin.html',
  styles: `
    .category { display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-4); background: var(--blanco); border: 1px solid var(--linea); border-radius: var(--radio-md); }
    .category--off { background: var(--crema); }
    .category__head { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; justify-content: space-between; }
    .category__head h2 { margin: 0; }
    .rows .row { background: var(--crema); }
    .row--off .row__title { color: var(--noche-suave); }
    .code { color: var(--noche-suave); }
    .meta { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
    .hint { margin: 0; color: var(--noche-suave); }
    .warning { display: flex; gap: var(--space-2); align-items: flex-start; margin: 0; padding: var(--space-3); border-radius: var(--radio-md); background: var(--amarillo-suave); color: var(--noche); }
    .inline { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: flex-end; width: 100%; }
    .inline .grow { flex: 1; min-width: 220px; width: auto; }
    .inline .code-field { width: 160px; }
    .inline .order-field { width: 96px; }
    textarea.mb-input { resize: vertical; }
    h2 { margin: 0; }
    .add-item { align-self: flex-start; }
  `,
})
export class CriteriaAdmin {
  private readonly api = inject(CriteriaApi);
  protected readonly criteria = this.api.adminResource();
  protected readonly busy = signal(false);
  protected readonly notice = signal<Notice | null>(null);

  protected readonly newCategory = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(CODE)] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
  });

  /** Categoría a la que se está agregando un ítem. */
  protected readonly addingTo = signal<number | null>(null);
  protected readonly newItem = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(CODE)] }),
    texto: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300)] }),
  });

  protected readonly editing = signal<Editing | null>(null);
  protected readonly edit = new FormGroup({
    texto: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300)] }),
    orden: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
  });

  protected show(control: FormControl): boolean {
    return control.invalid && control.touched;
  }

  protected isEditing(kind: Editing['kind'], id: number): boolean {
    const current = this.editing();
    return current?.kind === kind && current.id === id;
  }

  protected addCategory(event: Event): void {
    event.preventDefault();
    this.newCategory.markAllAsTouched();
    if (this.newCategory.invalid) return;
    const { codigo, nombre } = this.newCategory.getRawValue();
    this.run(this.api.createCategory(codigo.trim(), nombre.trim()), `Agregaste la categoría «${nombre.trim()}». Agregale sus ítems.`, () =>
      this.newCategory.reset(),
    );
  }

  protected startAdding(category: AdminCriteriaCategory): void {
    this.editing.set(null);
    this.newItem.reset();
    this.addingTo.set(category.id);
  }

  protected addItem(event: Event, category: AdminCriteriaCategory): void {
    event.preventDefault();
    this.newItem.markAllAsTouched();
    if (this.newItem.invalid) return;
    const { codigo, texto } = this.newItem.getRawValue();
    this.run(this.api.createItem(category.id, codigo.trim(), texto.trim()), `Agregaste el ítem a «${category.nombre}».`, () =>
      this.addingTo.set(null),
    );
  }

  protected startEditCategory(category: AdminCriteriaCategory): void {
    this.addingTo.set(null);
    this.edit.reset({ texto: category.nombre, orden: category.orden });
    this.editing.set({ kind: 'category', id: category.id });
  }

  protected startEditItem(item: AdminCriterion): void {
    this.addingTo.set(null);
    this.edit.reset({ texto: item.texto, orden: item.orden });
    this.editing.set({ kind: 'item', id: item.id, respuestas: item.respuestas });
  }

  protected saveCategory(event: Event, category: AdminCriteriaCategory): void {
    event.preventDefault();
    this.edit.markAllAsTouched();
    if (this.edit.invalid) return;
    const { texto, orden } = this.edit.getRawValue();
    this.update(this.api.updateCategory(category.id, { nombre: texto.trim(), orden }), `Guardaste la categoría «${texto.trim()}».`);
  }

  protected saveItem(event: Event, item: AdminCriterion): void {
    event.preventDefault();
    this.edit.markAllAsTouched();
    if (this.edit.invalid) return;
    const { texto, orden } = this.edit.getRawValue();
    const change: CriteriaChange = { texto: texto.trim(), orden };
    const textChanged = change.texto !== item.texto;
    if (
      textChanged &&
      item.respuestas > 0 &&
      !confirmAction(
        `Este ítem ya tiene ${this.answers(item.respuestas)}, que quedarán bajo el texto nuevo. ` +
          '¿Es solo una corrección de redacción, sin cambiar el sentido?',
      )
    ) {
      return;
    }
    this.update(this.api.updateItem(item.id, change), 'Guardaste el ítem.');
  }

  protected toggleCategory(category: AdminCriteriaCategory): void {
    if (category.activo && !confirmAction(`¿Desactivar «${category.nombre}»? Sus ítems dejan de pedirse y de mostrarse; las respuestas se conservan.`)) {
      return;
    }
    const text = category.activo ? `Desactivaste «${category.nombre}».` : `Activaste «${category.nombre}».`;
    this.run(this.api.updateCategory(category.id, { activo: !category.activo }), text);
  }

  protected toggleItem(item: AdminCriterion): void {
    if (item.activo && !confirmAction('¿Desactivar este ítem? Deja de pedirse en las reseñas y de mostrarse; las respuestas se conservan.')) {
      return;
    }
    this.run(this.api.updateItem(item.id, { activo: !item.activo }), item.activo ? 'Desactivaste el ítem.' : 'Activaste el ítem.');
  }

  protected answers(total: number): string {
    return total === 1 ? '1 respuesta' : `${total} respuestas`;
  }

  private update(action: Observable<unknown>, success: string): void {
    this.run(action, success, () => this.editing.set(null));
  }

  private run(action: Observable<unknown>, success: string, done?: () => void): void {
    this.busy.set(true);
    this.notice.set(null);
    action.subscribe({
      next: () => {
        this.busy.set(false);
        this.notice.set({ kind: 'ok', text: success });
        done?.();
        this.criteria.reload();
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.notice.set({ kind: 'error', text: apiErrorMessage(error) });
      },
    });
  }
}
