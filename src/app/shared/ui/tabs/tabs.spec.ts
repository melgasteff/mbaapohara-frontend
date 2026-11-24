import { TestBed } from '@angular/core/testing';
import { Tabs } from './tabs';

describe('Pestañas', () => {
  function setup() {
    const fixture = TestBed.createComponent(Tabs);
    fixture.componentRef.setInput('tabs', [{ valor: 'a', etiqueta: 'A', cantidad: 3 }, { valor: 'b', etiqueta: 'B', cantidad: 1, urgente: true }, { valor: 'c', etiqueta: 'C' }]);
    fixture.componentRef.setInput('value', 'a');
    fixture.componentRef.setInput('label', 'Estado');
    fixture.componentRef.setInput('panelId', 'panel');
    fixture.detectChanges();
    const tabs = () => [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('[role=tab]')];
    const press = (key: string) => {
      tabs().find((tab) => tab.tabIndex === 0)!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, tabs, press, selected: () => fixture.componentInstance.value() };
  }

  it('solo la elegida se alcanza con Tab y nombra al panel', () => {
    const { tabs } = setup();
    expect(tabs().map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
    expect(tabs()[0].id).toBe('panel-a');
    expect(tabs()[0].getAttribute('aria-controls')).toBe('panel');
  });

  it('las flechas recorren en círculo; Inicio y Fin van a los extremos, con el foco', () => {
    const { press, selected, tabs } = setup();
    press('ArrowLeft');
    expect(selected()).toBe('c');
    expect(document.activeElement).toBe(tabs()[2]);
    press('ArrowRight');
    expect(selected()).toBe('a');
    press('End');
    expect(selected()).toBe('c');
    press('Home');
    expect(selected()).toBe('a');
  });

  it('con clic también elige, y marca el contador que pide atención', () => {
    const { tabs, fixture, selected } = setup();
    tabs()[1].click();
    fixture.detectChanges();
    expect(selected()).toBe('b');
    expect(tabs()[1].querySelector('.is-urgent')?.textContent).toBe('1');
  });

  it('como etapas, numera los pasos y también se recorre hacia abajo', () => {
    const { fixture, tabs, press, selected } = setup();
    press('ArrowDown');
    expect(selected()).toBe('a');
    fixture.componentRef.setInput('look', 'etapas');
    fixture.detectChanges();
    expect(tabs().map((tab) => tab.querySelector('.step')?.textContent)).toEqual(['1', '2', '3']);
    press('ArrowDown');
    expect(selected()).toBe('b');
  });
});
