import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { PasswordField } from './password-field';

describe('Campo de contraseña', () => {
  function setup() {
    const fixture = TestBed.createComponent(PasswordField);
    fixture.componentRef.setInput('control', new FormControl('', { nonNullable: true }));
    fixture.componentRef.setInput('fieldId', 'clave');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, input: el.querySelector('input')!, button: el.querySelector('button')! };
  }

  it('empieza oculta; el botón la muestra y la vuelve a ocultar, y no envía el formulario', () => {
    const { fixture, input, button } = setup();
    expect(input.type).toBe('password');
    expect(button.type).toBe('button');
    button.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(button.getAttribute('aria-label')).toBe('Ocultar contraseña');
    button.click();
    fixture.detectChanges();
    expect(input.type).toBe('password');
    expect(button.getAttribute('aria-label')).toBe('Mostrar contraseña');
  });

  it('marca el error solo cuando lo hay', () => {
    const { fixture, input } = setup();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
