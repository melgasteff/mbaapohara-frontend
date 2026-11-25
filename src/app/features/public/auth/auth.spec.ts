import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { AccountCreatedError, AuthApi } from '../../../core/api/auth-api';
import { SignIn } from './sign-in/sign-in';
import { SignUp } from './sign-up/sign-up';

describe('Ingresar y crear cuenta', () => {
  const signIn = vi.fn();
  const register = vi.fn();
  let fixture: ComponentFixture<unknown>;
  let navigate: ReturnType<typeof vi.spyOn>;
  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => (el().textContent ?? '').replace(/\s+/g, ' ');

  beforeEach(() => {
    signIn.mockReset();
    register.mockReset();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: AuthApi, useValue: { signIn, register } }],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  function open(component: Type<unknown>, volver?: string): void {
    fixture = TestBed.createComponent(component);
    if (volver) fixture.componentRef.setInput('volver', volver);
    fixture.detectChanges();
  }
  function fill(id: string, value: string): void {
    const field = el().querySelector<HTMLInputElement>(`#${id}`)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }
  const check = (name: string) => el().querySelector<HTMLInputElement>(`[formcontrolname="${name}"]`)!.click();
  async function submit(): Promise<void> {
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('ingresar: con errores no envía, los explica y lleva el foco al primero', async () => {
    open(SignIn);
    fill('email', 'sin-arroba');
    await submit();
    expect(signIn).not.toHaveBeenCalled();
    expect(text()).toContain('Revisá el correo: falta algo, como la @.');
    expect(text()).toContain('Escribí tu contraseña.');
    expect(document.activeElement?.id).toBe('email');
  });

  it('ingresar: vuelve a la página pedida', async () => {
    signIn.mockReturnValue(of({}));
    open(SignIn, '/publicar?empresa=5');
    expect(text()).toContain('Ingresá para escribir tu reseña.');
    fill('email', 'persona@ejemplo.com');
    fill('password', 'x');
    await submit();
    expect(navigate).toHaveBeenCalledWith('/publicar?empresa=5');
  });

  it('ingresar: muestra el error de la API y deja volver a intentar', async () => {
    signIn.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    open(SignIn);
    fill('email', 'persona@ejemplo.com');
    fill('password', 'x');
    await submit();
    expect(el().querySelector('[role="alert"]')?.textContent).toContain('El correo o la contraseña no son correctos.');
    await submit();
    expect(signIn).toHaveBeenCalledTimes(2);
  });

  it('ingresar: un doble envío pide una sola vez, sin deshabilitar el botón', async () => {
    signIn.mockReturnValue(NEVER);
    open(SignIn);
    fill('email', 'persona@ejemplo.com');
    fill('password', 'x');
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(signIn).toHaveBeenCalledOnce();
    expect(el().querySelector<HTMLButtonElement>('.submit')).toMatchObject({ disabled: false });
    expect(text()).toContain('Ingresando…');
  });

  it('registro: tilda las 5 reglas en vivo', () => {
    open(SignUp);
    expect(el().querySelectorAll('.rules li').length).toBe(5);
    fill('password', 'abcDEF1');
    fixture.detectChanges();
    expect([...el().querySelectorAll('.rules li.ok')].length).toBe(3);
    fill('password', 'abcDEF1!');
    fixture.detectChanges();
    expect([...el().querySelectorAll('.rules li.ok')].length).toBe(5);
  });

  it('registro: exige las dos casillas, cada una con su mensaje', async () => {
    register.mockReturnValue(of({}));
    open(SignUp);
    fill('email', 'persona@ejemplo.com');
    fill('password', 'abcDEF1!');
    await submit();
    expect(text()).toContain('Para crear una cuenta tenés que tener 18 años o más.');
    expect(text()).toContain('Para crear la cuenta, aceptá los términos y la privacidad.');
    check('mayorDeEdad');
    await submit();
    expect(register).not.toHaveBeenCalled();
    check('aceptaTerminos');
    await submit();
    expect(register).toHaveBeenCalledWith({ email: 'persona@ejemplo.com', password: 'abcDEF1!', aceptaTerminos: true });
    expect(navigate).toHaveBeenCalledWith('/');
  });

  async function fillSignUp(): Promise<void> {
    fill('email', 'persona@ejemplo.com');
    fill('password', 'abcDEF1!');
    check('mayorDeEdad');
    check('aceptaTerminos');
    await submit();
  }

  it('registro: si la cuenta se creó y el ingreso da 429, lo dice y lleva a ingresar', async () => {
    register.mockReturnValue(throwError(() => new AccountCreatedError(new HttpErrorResponse({ status: 429 }))));
    open(SignUp, '/publicar');
    await fillSignUp();
    const alert = el().querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain('Tu cuenta se creó, pero hubo muchos intentos de ingreso.');
    expect(alert.textContent).not.toContain('Hiciste muchos intentos');
    expect(alert.querySelector('a')?.getAttribute('href')).toBe('/ingresar?volver=%2Fpublicar');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('registro: si la creación falla, muestra el error sin el enlace', async () => {
    register.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    open(SignUp);
    await fillSignUp();
    const alert = el().querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain('Ya hay una cuenta con ese correo.');
    expect(alert.querySelector('a')).toBeNull();
  });
});
