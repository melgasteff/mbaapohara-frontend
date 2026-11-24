import { TestBed } from '@angular/core/testing';
import { InlineConfirm } from './inline-confirm';

describe('Confirmación en línea', () => {
  async function render() {
    const fixture = TestBed.createComponent(InlineConfirm);
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    fixture.componentRef.setInput('message', '¿Borrar?');
    const events: string[] = [];
    fixture.componentInstance.confirmed.subscribe(() => events.push('sí'));
    fixture.componentInstance.cancelled.subscribe(() => events.push('no'));
    await fixture.whenStable();
    return { el, events };
  }

  it('avisa con role="alert" y deja el foco en «Cancelar»', async () => {
    const { el } = await render();
    expect(el.getAttribute('role')).toBe('alert');
    expect(el.textContent).toContain('¿Borrar?');
    expect(document.activeElement?.textContent).toBe('Cancelar');
    el.remove();
  });

  it('confirma, cancela y cancela con Escape', async () => {
    const { el, events } = await render();
    const [yes, no] = Array.from(el.querySelectorAll('button'));
    yes.click();
    no.click();
    no.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(events).toEqual(['sí', 'no', 'no']);
    el.remove();
  });
});
