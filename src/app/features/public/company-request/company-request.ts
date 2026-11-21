import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideCircleCheck } from '@lucide/angular';
import { apiErrorMessage } from '../../../core/api/api-error';
import { CompaniesApi } from '../../../core/api/companies-api';
import { PublicReviewsApi } from '../../../core/api/public-reviews-api';
import { CompanyRequestType } from '../../../core/models/moderation';
import { toId } from '../../../shared/route-params';
import { PageState } from '../../../shared/ui/page-state/page-state';

/**
 * Formulario para empresas (D5: no tienen cuenta; 3.9b). Se llega desde el perfil: con `?resena=` para pedir que se
 * revise una reseña, o con `?empresa=` para corregir los datos de la empresa y sus locales. La respuesta llega por
 * correo; el nombre y el correo se borran al responder.
 */
@Component({
  selector: 'app-company-request',
  imports: [ReactiveFormsModule, RouterLink, PageState, LucideCircleAlert, LucideCircleCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../legal/legal.css',
  templateUrl: './company-request.html',
  styles: `
    .form { display: flex; flex-direction: column; gap: var(--space-4); max-width: 560px; }
    .form .mb-field { width: 100%; }
    .quote { margin: 0; padding: var(--space-3) var(--space-4); background: var(--surface-sunken); border-radius: var(--radius-md); }
    .quote p { margin: 0; }
    .quote p + p { margin-top: var(--space-2); }
    .check { display: flex; gap: var(--space-2); align-items: flex-start; }
    .check input { accent-color: var(--yerba); margin-top: 4px; }
    .alert { display: flex; gap: var(--space-2); align-items: center; margin: 0; padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); }
    .alert--error { background: var(--danger-soft); color: var(--danger); }
    .alert--ok { background: var(--success-soft); color: var(--success); }
  `,
})
export class CompanyRequestPage {
  // Parámetros de la URL (withComponentInputBinding).
  readonly resena = input(undefined, { transform: toId });
  readonly empresa = input(undefined, { transform: toId });

  private readonly reviews = inject(PublicReviewsApi);
  protected readonly review = this.reviews.detailResource(this.resena);
  protected readonly company = inject(CompaniesApi).detailResource(computed(() => (this.resena() ? undefined : this.empresa())));

  protected readonly type = computed<CompanyRequestType | null>(() =>
    this.resena() ? 'revision_resena' : this.empresa() ? 'correccion_datos' : null,
  );

  protected readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)] }),
    correo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(254)] }),
    mensaje: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(20), Validators.maxLength(2000)] }),
    aceptaPrivacidad: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
  protected readonly submitted = signal(false);
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly done = signal<string | null>(null);

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected send(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    const type = this.type();
    if (this.form.invalid || !type) return;
    const { nombre, correo, mensaje, aceptaPrivacidad } = this.form.getRawValue();
    this.sending.set(true);
    this.error.set(null);
    this.reviews
      .requestRevision({
        tipo: type,
        ...(type === 'revision_resena' ? { idResena: this.resena() } : { idEmpresa: this.empresa() }),
        nombre: nombre.trim(),
        correo: correo.trim(),
        mensaje: mensaje.trim(),
        aceptaPrivacidad,
      })
      .subscribe({
        next: ({ mensaje: text }) => {
          this.sending.set(false);
          this.done.set(text);
        },
        error: (error: unknown) => {
          this.sending.set(false);
          this.error.set(apiErrorMessage(error));
        },
      });
  }
}
