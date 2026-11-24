import { TestBed } from '@angular/core/testing';
import { REJECTION_MESSAGES } from '../../../core/models/moderation';
import { RejectForm, Rejection } from './reject-form';

describe('Categoría y motivo', () => {
  async function setup() {
    const fixture = TestBed.createComponent(RejectForm);
    fixture.componentRef.setInput('initial', 'DP');
    fixture.componentRef.setInput('submitLabel', 'Enviar');
    const sent: Rejection[] = [];
    fixture.componentInstance.confirmed.subscribe((value) => sent.push(value));
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector('select')!;
    const text = el.querySelector('textarea')!;
    const pick = async (value: string) => {
      select.value = value;
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    const write = (value: string) => {
      text.value = value;
      text.dispatchEvent(new Event('input'));
    };
    const submit = async () => {
      el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      await fixture.whenStable();
    };
    return { el, text, sent, pick, write, submit, select };
  }

  it('propone el mensaje de la categoría y lo cambia con ella', async () => {
    const { text, pick, select } = await setup();
    expect(select.value).toBe('DP');
    expect(text.value).toBe(REJECTION_MESSAGES.DP);
    await pick('INS');
    expect(text.value).toBe(REJECTION_MESSAGES.INS);
  });

  it('no pisa un motivo escrito a mano', async () => {
    const { text, pick, write } = await setup();
    write('Sacá el nombre de la encargada.');
    await pick('TER');
    expect(text.value).toBe('Sacá el nombre de la encargada.');
  });

  it('un motivo corto o solo con espacios no se envía, y se explica', async () => {
    const { el, text, write, submit, sent } = await setup();
    write('   corto      ');
    await submit();
    expect(sent).toEqual([]);
    expect(text.getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement === text || el.querySelector('.mb-field-error') !== null).toBe(true);
    write('  Sacá el teléfono del texto.  ');
    await submit();
    expect(sent).toEqual([{ categoria: 'DP', motivo: 'Sacá el teléfono del texto.' }]);
  });
});
