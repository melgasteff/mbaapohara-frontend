import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterChip } from '../filter-chip/filter-chip';
import { SentenceFilter } from '../sentence-filter/sentence-filter';
import { FilterOption } from './option-list';

@Component({
  imports: [SentenceFilter, FilterChip],
  template: `
    <h1>En <app-sentence-filter label="Lugar" [place]="true" [options]="options" [value]="value()" (valueChange)="value.set($event)" /></h1>
    <app-filter-chip label="Contrato" [options]="options" [value]="value()" (valueChange)="value.set($event)" />
  `,
})
class Host {
  readonly value = signal<number | null>(null);
  readonly options: FilterOption<number>[] = [
    { valor: null, etiqueta: 'todo el país', detalle: 3 },
    { valor: 1, etiqueta: 'Central', detalle: 2 },
    { valor: 2, etiqueta: 'Ñeembucú', detalle: 1 },
  ];
}

describe('Lista de opciones (filtro en frase y chip)', () => {
  let fixture: ComponentFixture<Host>;
  let el: HTMLElement;
  const trigger = (index = 0) => el.querySelectorAll<HTMLButtonElement>('button')[index];
  const list = () => el.querySelector<HTMLElement>('[role=listbox]');
  const key = async (name: string) => {
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
    await fixture.whenStable();
  };
  const openList = async (index = 0) => {
    trigger(index).focus();
    trigger(index).click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await fixture.whenStable();
  });
  afterEach(() => el.remove());

  it('anuncia el filtro, su valor y los conteos', async () => {
    expect(trigger().getAttribute('aria-label')).toBe('Lugar: todo el país');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    await openList();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(list()!.querySelectorAll('[role=option]').length).toBe(3);
    expect(list()!.querySelector('[aria-selected=true]')?.textContent).toContain('todo el país');
    expect(list()!.textContent).toContain('2');
  });

  it('abre con el foco en la opción elegida, se mueve con flechas y elige con Enter', async () => {
    await openList();
    expect(document.activeElement?.textContent).toContain('todo el país');
    await key('ArrowDown');
    expect(document.activeElement?.textContent).toContain('Central');
    await key('Enter');
    expect(fixture.componentInstance.value()).toBe(1);
    expect(list()).toBeNull();
    expect(document.activeElement).toBe(trigger());
    expect(trigger().textContent).toContain('Central');
  });

  it('busca por letra sin distinguir tildes ni virgulillas', async () => {
    await openList();
    await key('n');
    expect(document.activeElement?.textContent).toContain('Ñeembucú');
    await key('Home');
    expect(document.activeElement?.textContent).toContain('todo el país');
  });

  it('Escape cierra sin cambiar el valor y devuelve el foco', async () => {
    await openList();
    await key('End');
    await key('Escape');
    expect(list()).toBeNull();
    expect(fixture.componentInstance.value()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('Tab cierra y deja el foco en el botón', async () => {
    await openList();
    await key('Tab');
    expect(list()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('un clic afuera la cierra', async () => {
    await openList();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await fixture.whenStable();
    expect(list()).toBeNull();
  });

  it('el chip muestra el valor y se marca', async () => {
    expect(trigger(1).textContent?.trim()).toBe('Contrato');
    fixture.componentInstance.value.set(1);
    await fixture.whenStable();
    expect(trigger(1).textContent?.trim()).toBe('Contrato: Central');
    expect(trigger(1).classList.contains('is-checked')).toBe(true);
  });
});
