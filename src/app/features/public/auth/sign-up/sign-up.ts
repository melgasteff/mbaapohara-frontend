import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircle, LucideCircleAlert, LucideCircleCheck, LucideLock } from '@lucide/angular';
import { AuthApi } from '../../../../core/api/auth-api';
import { safeReturnUrl } from '../../../../core/auth/guards';
import { authErrorMessage } from '../auth-errors';

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

/** Crear cuenta: correo, contraseña y aceptación de términos (D9). Al terminar inicia la sesión. */
@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterLink, LucideCircleAlert, LucideCircleCheck, LucideCircle, LucideLock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../auth-form.css',
  templateUrl: './sign-up.html',
})
export class SignUp {
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);

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
    aceptaTerminos: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitted = signal(false);

  private readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });
  protected readonly rules = computed(() =>
    PASSWORD_RULES.map((rule) => ({ text: rule.text, ok: rule.test(this.password()) })),
  );

  protected show(name: 'email' | 'password' | 'aceptaTerminos'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected submit(): void {
    this.submitted.set(true);
    this.error.set(null);
    if (this.form.invalid) return;
    this.sending.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.register({ email, password, aceptaTerminos: true }).subscribe({
      next: () => this.router.navigateByUrl(safeReturnUrl(this.volver())),
      error: (error: unknown) => {
        this.error.set(authErrorMessage(error, 'registro'));
        this.sending.set(false);
      },
    });
  }
}
