import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideCheck, LucideCircleAlert } from '@lucide/angular';
import { AuthApi } from '../../../core/api/auth-api';
import { SessionService } from '../../../core/auth/session.service';
import { ReviewDraftStore } from '../../../core/drafts/review-draft-store';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { PasswordField } from '../../../shared/ui/password-field/password-field';

type DownloadState = 'listo' | 'preparando' | 'descargado' | 'error';

/**
 * Mi cuenta: ver los datos, descargarlos y eliminar la cuenta (derechos que describe /privacidad).
 * Usa GET /users/me, GET /users/me/export y DELETE /users/me (tarea 1.5).
 */
@Component({
  selector: 'app-my-account',
  imports: [DatePipe, RouterLink, PageState, PasswordField, LucideCheck, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-account.html',
  styleUrl: './my-account.css',
})
export class MyAccount {
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly drafts = inject(ReviewDraftStore);
  private readonly injector = inject(Injector);

  protected readonly account = this.auth.meResource();

  protected readonly downloadState = signal<DownloadState>('listo');

  /** El formulario para eliminar se abre en línea, con un paso previo. */
  protected readonly confirming = signal(false);
  protected readonly password = new FormControl('', { nonNullable: true, validators: Validators.required });
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal('');
  private readonly field = viewChild(PasswordField);
  private readonly deleteButton = viewChild<ElementRef<HTMLButtonElement>>('deleteButton');

  protected download(): void {
    // Los botones no se deshabilitan: mientras prepara el archivo, otro clic no pide de nuevo.
    if (this.downloadState() === 'preparando') return;
    this.downloadState.set('preparando');
    this.auth.exportData().subscribe({
      next: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mbaapohara-mis-datos.json';
        link.click();
        URL.revokeObjectURL(url);
        this.downloadState.set('descargado');
      },
      error: () => this.downloadState.set('error'),
    });
  }

  protected askDelete(): void {
    this.confirming.set(true);
    afterNextRender(() => this.field()?.focus(), { injector: this.injector });
  }

  protected cancelDelete(): void {
    if (this.deleting()) return;
    this.confirming.set(false);
    this.deleteError.set('');
    this.password.reset();
    afterNextRender(() => this.deleteButton()?.nativeElement.focus(), { injector: this.injector });
  }

  protected remove(event: Event): void {
    event.preventDefault();
    if (this.deleting()) return;
    if (this.password.invalid) {
      this.fail('Escribí tu contraseña para confirmar.');
      return;
    }
    this.deleting.set(true);
    this.deleteError.set('');
    // Al terminar ya no hay sesión: el id se toma antes, para borrar también el borrador de este dispositivo.
    const accountId = this.session.account()?.id;
    this.auth.deleteAccount(this.password.value).subscribe({
      next: () => {
        if (accountId !== undefined) this.drafts.clear(accountId);
        this.router.navigate(['/'], { state: { cuentaEliminada: true } });
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.fail(
          error instanceof HttpErrorResponse && error.status === 401
            ? 'La contraseña no es correcta.'
            : 'No pudimos eliminar la cuenta. Intentá de nuevo.',
        );
      },
    });
  }

  private fail(message: string): void {
    this.deleteError.set(message);
    this.field()?.focus();
  }
}
