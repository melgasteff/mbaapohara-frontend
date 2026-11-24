import { ChangeDetectionStrategy, Component, ElementRef, inject, Injector, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideEyeOff } from '@lucide/angular';
import { AuthApi } from '../../../../core/api/auth-api';
import { safeReturnUrl } from '../../../../core/auth/guards';
import { Logo } from '../../../../shared/brand/logo/logo';
import { focusFirstInvalid } from '../../../../shared/focus-first-invalid';
import { PasswordField } from '../../../../shared/ui/password-field/password-field';
import { authErrorMessage, emailMessage } from '../auth-errors';
import { AuthPanel } from '../auth-panel/auth-panel';

/** Ingresar con correo y contraseña. Al terminar vuelve a la página pedida (?volver=). */
@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, RouterLink, AuthPanel, Logo, PasswordField, LucideCircleAlert, LucideEyeOff],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../auth-form.css',
  templateUrl: './sign-in.html',
})
export class SignIn {
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Página a la que volver después de ingresar (parámetro de la URL). */
  readonly volver = input<string>();

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitted = signal(false);

  protected show(name: 'email' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected emailError(): string {
    return emailMessage(this.form.controls.email);
  }

  protected submit(): void {
    // Un doble clic no envía dos veces; el botón no se deshabilita.
    if (this.sending()) return;
    this.submitted.set(true);
    this.error.set(null);
    if (this.form.invalid) {
      focusFirstInvalid(this.host, this.injector);
      return;
    }
    this.sending.set(true);
    this.auth.signIn(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(safeReturnUrl(this.volver())),
      error: (error: unknown) => {
        this.error.set(authErrorMessage(error, 'ingresar'));
        this.sending.set(false);
      },
    });
  }
}
