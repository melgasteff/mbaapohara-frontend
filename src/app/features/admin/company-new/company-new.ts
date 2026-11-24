import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideCircleAlert, LucideCircleCheck } from '@lucide/angular';
import { switchMap } from 'rxjs';
import { CompaniesAdminApi } from '../../../core/api/companies-admin-api';
import { SectorsApi } from '../../../core/api/sectors-api';
import { Company } from '../../../core/models/company';
import { CityPicker } from '../../../shared/ui/city-picker/city-picker';
import { apiErrorMessage } from '../api-error';

/**
 * Alta de empresa con su primer local. La API crea los dos pendientes (D10); como la carga la hace el
 * administrador, se aprueban enseguida. Si la aprobación falla, la empresa queda en Pendientes.
 */
@Component({
  selector: 'app-company-new',
  imports: [ReactiveFormsModule, RouterLink, CityPicker, LucideCircleAlert, LucideCircleCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  host: { class: 'admin-screen' },
  template: `
    <h1 class="h1">Nueva empresa</h1>

    <div role="status">
      @if (created(); as company) {
        <p class="notice notice--ok body-sm">
          <svg lucideCircleCheck [size]="16" aria-hidden="true"></svg>
          Creaste y aprobaste «{{ company.nombre }}».
          <a class="mb-link" [routerLink]="['/admin/empresas', company.id]">Gestionar sus locales</a>
        </p>
      }
      @if (error(); as message) {
        <p class="notice notice--error body-sm"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>{{ message }}</p>
      }
    </div>

    <form class="form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="mb-field" [class.mb-field-error]="show(form.controls.nombre)">
        <label for="nombre">Nombre comercial</label>
        <input id="nombre" class="mb-input" formControlName="nombre" maxlength="120" placeholder="Ej.: Supermercado Central" />
        @if (show(form.controls.nombre)) {
          <span class="mb-help"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Escribí el nombre.</span>
        }
      </div>

      <div class="mb-field" [class.mb-field-error]="show(form.controls.idRubro)">
        <label for="rubro">Rubro</label>
        <select id="rubro" class="mb-input" formControlName="idRubro">
          <option [ngValue]="null" disabled>Elegí el rubro</option>
          @for (sector of sectors.hasValue() ? sectors.value().data : []; track sector.id) {
            <option [ngValue]="sector.id">{{ sector.nombre }}</option>
          }
        </select>
        @if (show(form.controls.idRubro)) {
          <span class="mb-help"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí el rubro.</span>
        }
      </div>

      <fieldset formGroupName="local">
        <legend>Primer local</legend>
        <div class="mb-field" [class.mb-field-error]="show(form.controls.local.controls.nombre)">
          <label for="local-nombre">Nombre del local</label>
          <input id="local-nombre" class="mb-input" formControlName="nombre" maxlength="120" placeholder="Ej.: Casa central" />
          @if (show(form.controls.local.controls.nombre)) {
            <span class="mb-help"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Escribí el nombre del local.</span>
          }
        </div>
        <app-city-picker formControlName="idCiudad" [invalid]="show(form.controls.local.controls.idCiudad)" />
        @if (show(form.controls.local.controls.idCiudad)) {
          <span class="mb-help error-text"><svg lucideCircleAlert [size]="16" aria-hidden="true"></svg>Elegí la ciudad.</span>
        }
        <div class="mb-field">
          <label for="local-ref">Referencia (opcional)</label>
          <input id="local-ref" class="mb-input" formControlName="direccionReferencia" maxlength="200" placeholder="Ej.: Avda. España casi Brasil" />
        </div>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="mb-btn mb-btn-primary" [disabled]="sending()">
          {{ sending() ? 'Guardando…' : 'Crear empresa' }}
        </button>
        <a class="mb-btn mb-btn-ghost" routerLink="/admin/empresas">Cancelar</a>
      </div>
    </form>
  `,
  styles: `.error-text { color: var(--naranja-texto); display: flex; align-items: center; gap: var(--space-1); }`,
})
export class CompanyNew {
  private readonly api = inject(CompaniesAdminApi);
  protected readonly sectors = inject(SectorsApi).allResource();

  protected readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    idRubro: new FormControl<number | null>(null, Validators.required),
    local: new FormGroup({
      nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
      idCiudad: new FormControl<number | null>(null, Validators.required),
      direccionReferencia: new FormControl('', { nonNullable: true, validators: Validators.maxLength(200) }),
    }),
  });
  protected readonly submitted = signal(false);
  protected readonly sending = signal(false);
  protected readonly created = signal<Company | null>(null);
  protected readonly error = signal<string | null>(null);

  protected show(control: FormControl<unknown>): boolean {
    return control.invalid && (control.touched || this.submitted());
  }

  protected submit(): void {
    this.submitted.set(true);
    this.created.set(null);
    this.error.set(null);
    if (this.form.invalid) return;
    const { nombre, idRubro, local } = this.form.getRawValue();
    this.sending.set(true);
    // Si falla la aprobación, la empresa ya existe y quedó pendiente.
    let createdName: string | null = null;
    this.api
      .create({
        nombre: nombre.trim(),
        idRubro: idRubro!,
        local: {
          nombre: local.nombre.trim(),
          idCiudad: local.idCiudad!,
          ...(local.direccionReferencia.trim() ? { direccionReferencia: local.direccionReferencia.trim() } : {}),
        },
      })
      .pipe(
        switchMap((company) => {
          createdName = company.nombre;
          return this.api.approve(company.id);
        }),
      )
      .subscribe({
        next: (company) => {
          this.sending.set(false);
          this.created.set(company);
          this.form.reset();
          this.submitted.set(false);
        },
        error: (error: unknown) => {
          this.sending.set(false);
          const message = apiErrorMessage(error);
          this.error.set(createdName ? `Creamos «${createdName}», pero no pudimos aprobarla: ${message} Quedó en Pendientes.` : message);
        },
      });
  }
}
