import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideDownload, LucideLock, LucideTrash2 } from '@lucide/angular';
import { AuthApi } from '../../../core/api/auth-api';
import { PageState } from '../../../shared/ui/page-state/page-state';

/**
 * Mi cuenta: ver los datos, descargarlos y eliminar la cuenta (derechos que describe /privacidad).
 * Usa GET /users/me, GET /users/me/export y DELETE /users/me (tarea 1.5).
 */
@Component({
  selector: 'app-my-account',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, PageState, LucideCircleAlert, LucideDownload, LucideLock, LucideTrash2],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-account.html',
  styleUrl: './my-account.css',
})
export class MyAccount {
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly account = this.auth.meResource();

  protected readonly exporting = signal(false);
  protected readonly exportError = signal(false);

  protected readonly password = new FormControl('', { nonNullable: true, validators: Validators.required });
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected download(): void {
    this.exporting.set(true);
    this.exportError.set(false);
    this.auth.exportData().subscribe({
      next: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mbaapohara-mis-datos.json';
        link.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: () => {
        this.exporting.set(false);
        this.exportError.set(true);
      },
    });
  }

  protected remove(event: Event): void {
    event.preventDefault();
    this.password.markAsTouched();
    if (this.password.invalid) return;
    this.deleting.set(true);
    this.deleteError.set(null);
    this.auth.deleteAccount(this.password.value).subscribe({
      next: () => this.router.navigate(['/'], { state: { cuentaEliminada: true } }),
      error: (error: unknown) => {
        this.deleting.set(false);
        this.deleteError.set(
          error instanceof HttpErrorResponse && error.status === 401
            ? 'La contraseña no es correcta.'
            : 'No pudimos eliminar la cuenta. Intentá de nuevo.',
        );
      },
    });
  }
}
