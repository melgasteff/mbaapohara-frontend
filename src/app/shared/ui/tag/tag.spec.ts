import { TestBed } from '@angular/core/testing';
import { answerKind, Tag, TagKind } from './tag';

describe('Etiqueta', () => {
  it('cada tipo tiene su tono y siempre un ícono', () => {
    const tones: Record<TagKind, string> = {
      SI: 'mb-tag-success', publicada: 'mb-tag-success', EN_PARTE: 'mb-tag-warning', en_revision: 'mb-tag-warning',
      NO: 'mb-tag-naranja', rechazada: 'mb-tag-naranja', NO_SABE: 'mb-tag-neutro',
    };
    const fixture = TestBed.createComponent(Tag);
    for (const [kind, tone] of Object.entries(tones)) {
      fixture.componentRef.setInput('kind', kind);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.classList.contains(tone), kind).toBe(true);
      expect(el.querySelector('svg'), kind).not.toBeNull();
    }
  });

  it('una respuesta desconocida se muestra neutra', () => {
    expect(answerKind('NO')).toBe('NO');
    expect(answerKind('OTRA')).toBe('NO_SABE');
  });
});
