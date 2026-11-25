import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircle, LucideCircleAlert, LucideCircleCheck, LucideEyeOff } from '@lucide/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { AccountCreatedError, AuthApi } from '../../../../core/api/auth-api';
import { safeReturnUrl } from '../../../../core/auth/guards';
import { Logo } from '../../../../shared/brand/logo/logo';
import { focusFirstInvalid } from '../../../../shared/focus-first-invalid';
import { PasswordField } from '../../../../shared/ui/password-field/password-field';
import { authErrorMessage, emailMessage } from '../auth-errors';
import { AuthPanel } from '../auth-panel/auth-panel';

/** Reglas de contraseña de la API (RegisterDTO): se muestran y se validan antes de enviar. */
// Mismos criterios que IsStrongPassword (validator.js): letras sin tilde ni ñ y su lista de símbolos.
const SYMBOLS = /[-#!$@£%^&*()_+|~=`{}[\]:";'<>?,./\\ ]/;
const PASSWORD_RULES = [
  { text: 'Al menos 8 caracteres', test: (v: string) => v.length >= 8 },
  { text: 'Una mayúscula (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
  { text: 'Una minúscula (a-z)', test: (v: string) => /[a-z]/.test(v) },
  { text: 'Un número', test: (v: string) => /[0-9]/.test(v) },
  { text: 'Un símbolo, como ! ? # @ o -', test: (v: string) => SYMBOLS.test(v) },
];

/**
 * Crear cuenta: correo, contraseña, mayoría de edad y términos (D9). Al terminar inicia la sesión. La edad es una declaración:
 * se exige acá y no se envía, porque la API recibe una sola aceptación.
 */
@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterLink, AuthPanel, Logo, PasswordField, LucideCircleAlert, LucideCircleCheck, LucideCircle, LucideEyeOff],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../auth-form.css',
  templateUrl: './sign-up.html',
})
export class SignUp {
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly volver = input<string>();

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(254)] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(72),
        (control) => (PASSWORD_RULES.every((rule) => rule.test(control.value ?? '')) ? null : { weak: true }),
      ],
    }),
    mayorDeEdad: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
    aceptaTerminos: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  /** La cuenta se creó y falló solo el ingreso: no hay que volver a registrarse. */
  protected readonly created = signal(false);
  protected readonly submitted = signal(false);

  private readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });
  protected readonly rules = computed(() =>
    PASSWORD_RULES.map((rule) => ({ text: rule.text, ok: rule.test(this.password()) })),
  );

  protected show(name: 'email' | 'password' | 'mayorDeEdad' | 'aceptaTerminos'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected emailError(): string {
    return emailMessage(this.form.controls.email);
  }

  protected passwordError(): string {
    const { password } = this.form.controls;
    if (!password.value) return 'Escribí una contraseña.';
    return password.hasError('maxlength') ? 'La contraseña puede tener hasta 72 caracteres.' : 'La contraseña todavía no cumple todas las reglas.';
  }

  protected submit(): void {
    // Un doble clic no envía dos veces; el botón no se deshabilita.
    if (this.sending()) return;
    this.submitted.set(true);
    this.error.set(null);
    this.created.set(false);
    if (this.form.invalid) {
      focusFirstInvalid(this.host, this.injector);
      return;
    }
    this.sending.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.register({ email, password, aceptaTerminos: true }).subscribe({
      next: () => this.router.navigateByUrl(safeReturnUrl(this.volver())),
      error: (error: unknown) => {
        if (error instanceof AccountCreatedError) {
          const limited = error.cause instanceof HttpErrorResponse && error.cause.status === 429;
          this.created.set(true);
          this.error.set(
            limited
              ? 'Tu cuenta se creó, pero hubo muchos intentos de ingreso. Esperá un minuto e ingresá con tu correo y contraseña.'
              : 'Tu cuenta se creó, pero no pudimos iniciar la sesión. Ingresá con tu correo y contraseña.',
          );
        } else {
          this.error.set(authErrorMessage(error, 'registro'));
        }
        this.sending.set(false);
      },
    });
  }
}
