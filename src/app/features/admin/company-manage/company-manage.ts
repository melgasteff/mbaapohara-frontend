import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCircleAlert } from '@lucide/angular';
import { Observable, switchMap } from 'rxjs';
import { CompaniesAdminApi } from '../../../core/api/companies-admin-api';
import { CompaniesApi } from '../../../core/api/companies-api';
import { OfficesAdminApi } from '../../../core/api/offices-admin-api';
import { SectorsApi } from '../../../core/api/sectors-api';
import { Office, SaveOffice } from '../../../core/models/company';
import { CityPicker } from '../../../shared/ui/city-picker/city-picker';
import { InlineConfirm } from '../../../shared/ui/inline-confirm/inline-confirm';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { toId } from '../../../shared/route-params';
import { AdminActions } from '../admin-actions';
import { AdminNotice } from '../admin-notice/admin-notice';
import { STATUS } from '../status';

function officeForm() {
  return new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    idCiudad: new FormControl<number | null>(null, Validators.required),
    direccionReferencia: new FormControl('', { nonNullable: true, validators: Validators.maxLength(200) }),
  });
}

function toSaveOffice(form: ReturnType<typeof officeForm>): SaveOffice {
  const { nombre, idCiudad, direccionReferencia } = form.getRawValue();
  return { nombre: nombre.trim(), idCiudad: idCiudad!, ...(direccionReferencia.trim() ? { direccionReferencia: direccionReferencia.trim() } : {}) };
}

/**
 * Gestionar una empresa aprobada: editar nombre y rubro, y sus locales en todos los estados.
 * Las empresas pendientes se aprueban o rechazan desde el listado.
 */
@Component({
  selector: 'app-company-manage',
  imports: [ReactiveFormsModule, RouterLink, CityPicker, InlineConfirm, PageState, AdminNotice, LucideArrowLeft, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminActions],
  styleUrl: '../admin.css',
  host: { class: 'admin-screen' },
  templateUrl: './company-manage.html',
  styles: `
    h2 { margin: var(--space-4) 0 0; }
    h3 { font-size: 16px; line-height: 24px; }
    .delete { color: var(--naranja-texto); }
  `,
})
export class CompanyManage {
  private readonly companiesAdmin = inject(CompaniesAdminApi);
  private readonly officesAdmin = inject(OfficesAdminApi);

  readonly id = input(undefined, { transform: toId });

  protected readonly status = STATUS;
  protected readonly sectors = inject(SectorsApi).allResource();
  protected readonly company = inject(CompaniesApi).detailResource(this.id);
  protected readonly offices = this.officesAdmin.listResource(
    computed(() => (this.id() ? { empresa: this.id(), pageSize: 100 } : undefined)),
  );
  protected readonly notFound = computed(() => {
    const error = this.company.error();
    return !this.id() || (error instanceof HttpErrorResponse && error.status === 404);
  });

  protected readonly companyForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    idRubro: new FormControl<number | null>(null, Validators.required),
  });
  protected readonly newOffice = officeForm();
  protected readonly editOffice = officeForm();
  protected readonly editingId = signal<number | null>(null);
  protected readonly actions = inject(AdminActions);
  protected readonly submittedNew = signal(false);

  constructor() {
    // Carga los datos de la empresa en el formulario cuando llegan (y después de guardar).
    effect(() => {
      if (this.company.hasValue()) {
        const { nombre, rubro } = this.company.value();
        this.companyForm.reset({ nombre, idRubro: rubro.id });
      }
    });
  }

  protected saveCompany(): void {
    this.companyForm.markAllAsTouched();
    if (this.companyForm.invalid) return;
    const { nombre, idRubro } = this.companyForm.getRawValue();
    this.run('guardar', this.companiesAdmin.update(this.id()!, { nombre: nombre.trim(), idRubro: idRubro! }), 'Guardaste los datos de la empresa.', () =>
      this.company.reload(),
    );
  }

  protected addOffice(): void {
    this.submittedNew.set(true);
    if (this.newOffice.invalid) return;
    const data = toSaveOffice(this.newOffice);
    this.run(
      'agregar',
      this.officesAdmin.create(this.id()!, data).pipe(switchMap((office) => this.officesAdmin.approve(office.id))),
      `Agregaste el local «${data.nombre}».`,
      () => {
        this.newOffice.reset();
        this.submittedNew.set(false);
        this.offices.reload();
      },
    );
  }

  protected startEdit(office: Office): void {
    this.actions.confirming.set(null);
    this.editOffice.reset({ nombre: office.nombre, idCiudad: office.ciudad.id, direccionReferencia: office.direccionReferencia ?? '' });
    this.editingId.set(office.id);
  }

  protected saveOffice(office: Office): void {
    this.editOffice.markAllAsTouched();
    if (this.editOffice.invalid) return;
    this.run(`editar-${office.id}`, this.officesAdmin.update(office.id, toSaveOffice(this.editOffice)), 'Guardaste el local.', () => {
      this.editingId.set(null);
      this.offices.reload();
    });
  }

  protected approveOffice(office: Office): void {
    this.run(`aprobar-${office.id}`, this.officesAdmin.approve(office.id), `Aprobaste el local «${office.nombre}».`, () => this.offices.reload());
  }

  protected rejectOffice(office: Office): void {
    this.run(`rechazar-${office.id}`, this.officesAdmin.reject(office.id), `Rechazaste el local «${office.nombre}».`, () => this.offices.reload());
  }

  protected removeOffice(office: Office): void {
    this.run(`eliminar-${office.id}`, this.officesAdmin.remove(office.id), `Eliminaste el local «${office.nombre}».`, () => this.offices.reload());
  }

  protected showNew(name: 'nombre' | 'idCiudad'): boolean {
    const control = this.newOffice.controls[name];
    return control.invalid && (control.touched || this.submittedNew());
  }

  private run(key: string, action: Observable<unknown>, success: string, after: () => void): void {
    this.actions.run(key, action, success, {
      done: () => {
        after();
        this.actions.focus('h1');
      },
    });
  }
}
