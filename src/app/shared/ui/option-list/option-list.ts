import {
  afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, input, output, signal, viewChild,
} from '@angular/core';

/** Opción de un filtro. `valor` es `null` para «todos». */
export interface FilterOption<T = unknown> {
  valor: T | null;
  etiqueta: string;
  /** Dato a la derecha: cuántos resultados dejaría la opción, o la ciudad de un local. */
  detalle?: string | number;
}

let nextId = 0;

/**
 * Botón con lista desplegable (patrón listbox), base del filtro en frase y de los chips. Teclado: flechas, Inicio,
 * Fin y letras para moverse; Enter o espacio elige; Escape y Tab cierran. El foco vuelve siempre al botón.
 * En móvil la lista sube como panel desde abajo.
 */
@Component({
  selector: 'app-option-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:pointerdown)': 'onOutside($event)', '(focusout)': 'onFocusOut($event)' },
  styleUrl: './option-list.css',
  template: `
    <button
      #trigger
      type="button"
      [class]="triggerClass()"
      aria-haspopup="listbox"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? listId : null"
      [attr.aria-label]="label() + ': ' + valueText()"
      (click)="toggle()"
      (keydown.arrowdown)="openFromKey($event)"
      (keydown.arrowup)="openFromKey($event)"
    >
      <ng-content />
    </button>
    @if (open()) {
      <div class="backdrop" (click)="close(true)"></div>
      <ul #list class="list" [class.align-end]="alignEnd()" role="listbox" [id]="listId" [attr.aria-label]="label()" (keydown)="onKey($event)">
        @for (option of options(); track $index) {
          <li
            role="option"
            [attr.aria-selected]="option.valor === value()"
            [tabindex]="$index === active() ? 0 : -1"
            (click)="select(option)"
          >
            <span>{{ option.etiqueta }}</span>
            @if (option.detalle !== undefined) { <span class="detail">{{ option.detalle }}</span> }
          </li>
        }
      </ul>
    }
  `,
})
export class OptionList<T = unknown> {
  /** Nombre del filtro para lectores de pantalla: «Rubro». */
  readonly label = input.required<string>();
  readonly options = input.required<FilterOption<T>[]>();
  readonly value = input<T | null>(null);
  readonly triggerClass = input('');
  readonly valueChange = output<T | null>();

  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly list = viewChild<ElementRef<HTMLUListElement>>('list');

  protected readonly listId = `lista-${nextId++}`;
  protected readonly open = signal(false);
  protected readonly active = signal(0);
  protected readonly alignEnd = signal(false);
  private readonly selectedIndex = computed(() => this.options().findIndex((o) => o.valor === this.value()));
  protected readonly valueText = computed(() => this.options()[this.selectedIndex()]?.etiqueta ?? '');

  protected toggle(): void {
    if (this.open()) this.close(true);
    else this.show();
  }

  protected openFromKey(event: Event): void {
    event.preventDefault();
    this.show();
  }

  protected select(option: FilterOption<T>): void {
    this.close(true);
    if (option.valor !== this.value()) this.valueChange.emit(option.valor);
  }

  protected close(returnFocus: boolean): void {
    if (!this.open()) return;
    this.open.set(false);
    if (returnFocus) this.trigger().nativeElement.focus();
  }

  protected onKey(event: KeyboardEvent): void {
    const last = this.options().length - 1;
    const move = (index: number) => {
      event.preventDefault();
      this.focusOption(Math.min(Math.max(index, 0), last));
    };
    switch (event.key) {
      case 'ArrowDown': return move(this.active() + 1);
      case 'ArrowUp': return move(this.active() - 1);
      case 'Home': return move(0);
      case 'End': return move(last);
      // Sin preventDefault, Tab pasaría a una opción que está por desaparecer y el foco se perdería.
      case 'Tab':
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        return this.close(true);
      case 'Enter':
      case ' ':
        event.preventDefault();
        return this.select(this.options()[this.active()]);
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) this.focusByLetter(event.key);
    }
  }

  protected onOutside(event: Event): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close(false);
  }

  /** El foco salió hacia otro elemento (por ejemplo, con el lector de pantalla): se cierra sin robarlo. */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && !this.host.nativeElement.contains(next)) this.close(false);
  }

  private show(): void {
    if (this.open() || !this.options().length) return;
    this.alignEnd.set(false);
    this.active.set(Math.max(this.selectedIndex(), 0));
    this.open.set(true);
    afterNextRender(
      () => {
        const list = this.list()?.nativeElement;
        if (!list) return;
        this.alignEnd.set(list.getBoundingClientRect().right > document.documentElement.clientWidth);
        this.focusOption(this.active());
      },
      { injector: this.injector },
    );
  }

  private focusOption(index: number): void {
    this.active.set(index);
    (this.list()?.nativeElement.children[index] as HTMLElement | undefined)?.focus();
  }

  private focusByLetter(letter: string): void {
    const simple = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es');
    const options = this.options();
    for (let step = 1; step <= options.length; step++) {
      const index = (this.active() + step) % options.length;
      if (simple(options[index].etiqueta).startsWith(simple(letter))) return this.focusOption(index);
    }
  }
}
