import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideLock } from '@lucide/angular';
import { AuthApi } from '../../../../core/api/auth-api';
import { safeReturnUrl } from '../../../../core/auth/guards';
import { authErrorMessage } from '../auth-errors';

/** Ingresar con correo y contraseña. Al terminar vuelve a la página pedida (?volver=). */
@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, RouterLink, LucideCircleAlert, LucideLock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../auth-form.css',
  templateUrl: './sign-in.html',
})
export class SignIn {
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);

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

  protected submit(): void {
    this.submitted.set(true);
    this.error.set(null);
    if (this.form.invalid) return;
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
