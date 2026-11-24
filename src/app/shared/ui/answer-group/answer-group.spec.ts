import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerGroup } from './answer-group';

describe('Grupo de respuestas', () => {
  let fixture: ComponentFixture<AnswerGroup>;
  let picked: string[];
  let saved: string[];
  const inputs = () => [...(fixture.nativeElement as HTMLElement).querySelectorAll('input')];
  const key = (type: 'keydown' | 'keyup', name: string) => inputs()[0].dispatchEvent(new KeyboardEvent(type, { key: name, bubbles: true }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerGroup);
    fixture.componentRef.setInput('options', [{ valor: 'SI', etiqueta: 'Sí' }, { valor: 'NO', etiqueta: 'No' }]);
    fixture.componentRef.setInput('labelledBy', 'titulo');
    picked = [];
    saved = [];
    fixture.componentInstance.picked.subscribe((value) => picked.push(value));
    fixture.componentInstance.registerOnChange((value) => saved.push(value));
    fixture.detectChanges();
  });

  it('con clic guarda y avisa, y al avisar el valor ya está guardado', () => {
    let savedWhenPicked: string[] = [];
    fixture.componentInstance.picked.subscribe(() => (savedWhenPicked = [...saved]));
    inputs()[1].click();
    expect(picked).toEqual(['NO']);
    expect(savedWhenPicked).toEqual(['NO']);
  });

  it('avisa también al tocar la que ya estaba elegida', () => {
    fixture.componentInstance.writeValue('SI');
    fixture.detectChanges();
    inputs()[0].click();
    expect(picked).toEqual(['SI']);
  });

  it('con las flechas marca sin avanzar; Enter confirma', () => {
    key('keydown', 'ArrowDown');
    inputs()[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true })); // el foco se mueve antes del clic
    inputs()[1].click(); // el navegador dispara «click» al mover con flechas
    expect(saved).toContain('NO');
    expect(picked).toEqual([]);
    key('keyup', 'ArrowDown');
    key('keydown', 'Enter');
    expect(picked).toEqual(['NO']);
  });

  it('no cancela las teclas: el espacio tiene que llegar al radio', () => {
    for (const type of ['keydown', 'keyup'] as const) {
      const event = new KeyboardEvent(type, { key: ' ', bubbles: true, cancelable: true });
      inputs()[0].dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
  });

  it('el espacio sobre la ya marcada también confirma', () => {
    fixture.componentInstance.writeValue('SI');
    fixture.detectChanges();
    key('keydown', ' ');
    expect(picked).toEqual(['SI']);
  });
});
