import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideArrowDown, LucideArrowUp, LucideCircleAlert, LucidePlus, LucideTriangleAlert } from '@lucide/angular';
import { concat, Observable, toArray } from 'rxjs';
import { CriteriaApi } from '../../../core/api/criteria-api';
import { AdminCriteriaCategory, AdminCriterion, CriteriaChange } from '../../../core/models/criteria';
import { keepWhileLoading } from '../../../shared/keep-while-loading';
import { InlineConfirm } from '../../../shared/ui/inline-confirm/inline-confirm';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { Switch } from '../../../shared/ui/switch/switch';
import { AdminActions } from '../admin-actions';
import { AdminNotice } from '../admin-notice/admin-notice';
import { moveChanges } from './reorder';

/** Código estable: letras sin tildes, números y guion bajo. La API lo pasa a mayúsculas. */
const CODE = /^[A-Za-z0-9_]{2,30}$/;

/** Lo que se está editando o agregando, de a uno por vez. */
type Open = { kind: 'category' | 'item' | 'new-item'; id: number } | { kind: 'new-category' };

/**
 * Criterios de la reseña (tarea 3.8): agregar categorías e ítems, corregir su texto, ordenarlos y desactivarlos.
 * No se borran: así las respuestas guardadas siguen apuntando a su criterio.
 */
@Component({
  selector: 'app-criteria-admin',
  imports: [
    ReactiveFormsModule, InlineConfirm, PageState, Switch, AdminNotice, LucideArrowDown, LucideArrowUp, LucideCircleAlert, LucidePlus, LucideTriangleAlert,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminActions],
  styleUrls: ['../admin.css', './criteria-admin.css'],
  host: { class: 'admin-screen' },
  templateUrl: './criteria-admin.html',
})
export class CriteriaAdmin {
  private readonly api = inject(CriteriaApi);
  protected readonly actions = inject(AdminActions);
  protected readonly criteria = this.api.adminResource();
  protected readonly data = keepWhileLoading(this.criteria);

  protected readonly open = signal<Open | null>(null);
  protected readonly newCategory = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(CODE)] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
  });
  protected readonly newItem = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(CODE)] }),
    texto: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300)] }),
  });
  protected readonly edit = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300)] });

  /** Botón que recupera el foco cuando llega la lista reordenada: al mover el elemento, el navegador lo pierde. */
  private refocus: string | null = null;

  constructor() {
    effect(() => {
      this.data();
      if (this.refocus) untracked(() => this.actions.focus(this.refocus!));
      this.refocus = null;
    });
  }

  protected show(control: FormControl): boolean {
    return control.invalid && control.touched;
  }

  protected isOpen(kind: Open['kind'], id?: number): boolean {
    const current = this.open();
    return current?.kind === kind && (current.kind === 'new-category' || current.id === id);
  }

  protected answers(total: number): string {
    return total === 1 ? '1 respuesta' : `${total} respuestas`;
  }

  protected startNewCategory(): void {
    this.newCategory.reset();
    this.start({ kind: 'new-category' }, '#cat-codigo');
  }

  protected addCategory(event: Event): void {
    event.preventDefault();
    this.newCategory.markAllAsTouched();
    if (this.newCategory.invalid) return;
    const { codigo, nombre } = this.newCategory.getRawValue();
    this.run('categoria-nueva', this.api.createCategory(codigo.trim(), nombre.trim()), `Agregaste la categoría «${nombre.trim()}». Agregale sus ítems.`);
  }

  protected startNewItem(category: AdminCriteriaCategory): void {
    this.newItem.reset();
    this.start({ kind: 'new-item', id: category.id }, `#item-codigo-${category.id}`);
  }

  protected addItem(event: Event, category: AdminCriteriaCategory): void {
    event.preventDefault();
    this.newItem.markAllAsTouched();
    if (this.newItem.invalid) return;
    const { codigo, texto } = this.newItem.getRawValue();
    this.run('item-nuevo', this.api.createItem(category.id, codigo.trim(), texto.trim()), `Agregaste el ítem a «${category.nombre}».`);
  }

  protected startEdit(kind: 'category' | 'item', id: number, text: string): void {
    this.edit.reset(text);
    this.start({ kind, id }, `#editar-${kind}-${id}`);
  }

  protected saveCategory(event: Event, category: AdminCriteriaCategory): void {
    event.preventDefault();
    if (!this.validEdit()) return;
    const nombre = this.edit.value.trim();
    this.run(`categoria-${category.id}`, this.api.updateCategory(category.id, { nombre }), `Guardaste la categoría «${nombre}».`);
  }

  /** Con respuestas, cambiar el texto se confirma: quedan bajo el texto nuevo. */
  protected askSaveItem(event: Event, item: AdminCriterion): void {
    event.preventDefault();
    if (!this.validEdit()) return;
    if (this.edit.value.trim() !== item.texto && item.respuestas > 0) this.actions.ask(`texto-${item.id}`);
    else this.saveItem(item);
  }

  protected saveItem(item: AdminCriterion): void {
    this.run(`texto-${item.id}`, this.api.updateItem(item.id, { texto: this.edit.value.trim() }), 'Guardaste el ítem.');
  }

  protected moveCategory(category: AdminCriteriaCategory, step: -1 | 1): void {
    const changes = moveChanges(this.data() ?? [], category.id, step);
    this.move(changes, (id, change) => this.api.updateCategory(id, change), category.nombre, `[data-mover="categoria-${category.id}-${step}"]`);
  }

  protected moveItem(category: AdminCriteriaCategory, item: AdminCriterion, step: -1 | 1): void {
    const changes = moveChanges(category.items, item.id, step);
    this.move(changes, (id, change) => this.api.updateItem(id, change), item.texto, `[data-mover="item-${item.id}-${step}"]`);
  }

  /** Activar es directo; desactivar se confirma. */
  protected toggleCategory(category: AdminCriteriaCategory): void {
    if (category.activo) this.actions.ask(`apagar-categoria-${category.id}`);
    else this.setCategory(category, true);
  }

  protected setCategory(category: AdminCriteriaCategory, activo: boolean): void {
    this.run(`apagar-categoria-${category.id}`, this.api.updateCategory(category.id, { activo }), `${activo ? 'Activaste' : 'Desactivaste'} «${category.nombre}».`);
  }

  protected toggleItem(item: AdminCriterion): void {
    if (item.activo) this.actions.ask(`apagar-item-${item.id}`);
    else this.setItem(item, true);
  }

  protected setItem(item: AdminCriterion, activo: boolean): void {
    this.run(`apagar-item-${item.id}`, this.api.updateItem(item.id, { activo }), activo ? 'Activaste el ítem.' : 'Desactivaste el ítem.');
  }

  private validEdit(): boolean {
    this.edit.markAsTouched();
    return this.edit.valid && this.edit.value.trim() !== '';
  }

  private start(open: Open, focus: string): void {
    if (this.actions.busy() !== null) return;
    this.actions.confirming.set(null);
    this.open.set(open);
    this.actions.focus(focus);
  }

  /** Los cambios van de a uno, en orden. No es atómico: si uno falla, se vuelve a pedir la lista. */
  private move(changes: { id: number; orden: number }[], update: (id: number, change: CriteriaChange) => Observable<unknown>, name: string, focus: string): void {
    if (!changes.length) return;
    this.actions.run('mover', concat(...changes.map(({ id, orden }) => update(id, { orden }))).pipe(toArray()), `Moviste «${name}».`, {
      done: () => {
        this.refocus = focus;
        this.criteria.reload();
      },
      failed: () => this.criteria.reload(),
    });
  }

  private run(key: string, action: Observable<unknown>, success: string): void {
    this.actions.run(key, action, success, {
      done: () => {
        this.open.set(null);
        this.criteria.reload();
        this.actions.focus('h1');
      },
    });
  }
}
