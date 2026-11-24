import { TestBed } from '@angular/core/testing';
import { ComplianceGroup } from '../../../core/models/review';
import { answerCounts } from './answer-counts';
import { ReviewCard } from './review-card';

const row = (codigo: string, valor: string, etiqueta: string) => ({ codigo, texto: `Ítem ${codigo}`, valor, etiqueta });
const groups: ComplianceGroup[] = [
  { categoria: 'Primera', filas: [row('A1', 'SI', 'Sí'), row('A2', 'NO_SABE', 'No sé o no aplica')] },
  { categoria: 'Segunda', filas: [row('B1', 'SI', 'Sí'), row('B2', 'NO', 'No'), row('B3', 'EN_PARTE', 'En parte')] },
];

describe('Tarjeta de reseña', () => {
  it('cuenta las respuestas sin «No sé o no aplica»', () => {
    expect(answerCounts(groups)).toEqual({ si: 2, enParte: 1, no: 1 });
    expect(answerCounts([])).toEqual({ si: 0, enParte: 0, no: 0 });
  });

  it('muestra número y palabra, y despliega el detalle de derechos', async () => {
    const fixture = TestBed.createComponent(ReviewCard);
    const set = (name: string, value: unknown) => fixture.componentRef.setInput(name, value);
    set('rating', 4); set('word', 'Bueno'); set('good', 'x'); set('toImprove', 'y'); set('compliance', groups);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.mb-rating-value')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('4 · Bueno');
    const toggle = el.querySelector<HTMLButtonElement>('.rights__toggle')!;
    const detail = el.querySelector<HTMLElement>(`#${toggle.getAttribute('aria-controls')}`)!;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(detail.hidden).toBe(true);
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(detail.hidden).toBe(false);
    expect(detail.querySelectorAll('li').length).toBe(5);
  });

  it('sin respuestas no muestra la línea de derechos', async () => {
    const fixture = TestBed.createComponent(ReviewCard);
    for (const [name, value] of [['rating', 3], ['good', 'x'], ['toImprove', 'y']] as const) fixture.componentRef.setInput(name, value);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.rights')).toBeNull();
  });
});
