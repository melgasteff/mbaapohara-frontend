import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { AdminCounts } from '../../../core/api/admin-counts';
import { CompaniesAdminApi } from '../../../core/api/companies-admin-api';
import { JobsApi } from '../../../core/api/jobs-api';
import { OfficesAdminApi } from '../../../core/api/offices-admin-api';
import { SessionService } from '../../../core/auth/session.service';
import { Company, ProposalStatus } from '../../../core/models/company';
import { routes } from '../../../app.routes';
import { JobsAdmin } from '../jobs-admin/jobs-admin';
import { CompaniesAdmin } from './companies-admin';

const company = (id: number, estado: ProposalStatus): Company => ({ id, nombre: `Empresa ${id}`, rubro: { id: 1, codigoCiiu: 'H', nombre: 'Transporte', grupo: 'transporte' }, estado });
const resource = <T>(data: T[], reload = vi.fn()) => ({ error: signal(undefined), hasValue: () => true, value: signal({ data, total: data.length, page: 1, pageSize: 20 }), reload });

describe('Administración de empresas y cargos', () => {
  const companies = { approve: vi.fn(), reject: vi.fn(), remove: vi.fn() };
  const offices = { approve: vi.fn(), reject: vi.fn() };
  const jobs = { approve: vi.fn(), reject: vi.fn(), create: vi.fn(), remove: vi.fn() };
  let list: Company[];
  let fixture: ComponentFixture<unknown>;
  const el = () => fixture.nativeElement as HTMLElement;
  const button = (label: string) => [...el().querySelectorAll<HTMLElement>('button, a')].find((b) => b.textContent?.trim().startsWith(label))!;
  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }
  async function click(target: HTMLElement): Promise<void> {
    target.click();
    await settle();
  }
  async function open(component: Type<unknown>, inputs: Record<string, unknown> = {}): Promise<void> {
    fixture = TestBed.createComponent(component);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    await settle();
  }

  beforeEach(() => {
    for (const api of [companies, offices, jobs]) for (const mock of Object.values(api)) mock.mockReset().mockReturnValue(of({}));
    list = [company(1, 'pendiente')];
    const office = { id: 8, nombre: 'Centro', idEmpresa: 1, ciudad: { id: 1, nombre: 'Luque', idDepartamento: 1 }, direccionReferencia: null, estado: 'pendiente', empresa: { id: 1, nombre: 'Empresa 1' } };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: AdminCounts, useValue: { refresh: vi.fn(), count: () => signal(2) } },
        { provide: CompaniesAdminApi, useValue: { ...companies, listResource: () => resource(list) } },
        { provide: OfficesAdminApi, useValue: { ...offices, listResource: () => resource([office]) } },
        { provide: JobsApi, useValue: { ...jobs, allResource: () => resource([{ id: 1, descripcion: 'Cajera' }]), adminResource: () => resource([{ id: 2, descripcion: 'Delivery' }]) } },
      ],
    });
  });

  it('pendientes: aprobar es directo; rechazar se confirma', async () => {
    await open(CompaniesAdmin);
    await click(button('Aprobar'));
    expect(companies.approve).toHaveBeenCalledWith(1);
    await click(button('Rechazar'));
    expect(companies.reject).not.toHaveBeenCalled();
    await click(button('Cancelar'));
    expect(document.activeElement).toBe(button('Rechazar'));
    await click(button('Rechazar'));
    await click(button('Sí, rechazar'));
    expect(companies.reject).toHaveBeenCalledWith(1);
  });

  it('aprobadas: gestionar y eliminar, con el sello de su rubro', async () => {
    list = [company(1, 'aprobada')];
    await open(CompaniesAdmin, { estado: 'aprobada' });
    expect(button('Gestionar').getAttribute('href')).toBe('/admin/empresas/1');
    expect(el().querySelector('app-company-seal')?.classList).toContain('transporte');
    await click(button('Eliminar'));
    await click(button('Sí, eliminar'));
    expect(companies.remove).toHaveBeenCalledWith(1);
  });

  it('no muestra filas de otro estado con las acciones de la pestaña nueva', async () => {
    await open(CompaniesAdmin, { estado: 'rechazada' });
    expect(el().querySelector('.rows')).toBeNull();
  });

  it('la pestaña va en la URL; «Locales pendientes» está adentro', async () => {
    await open(CompaniesAdmin);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await click([...el().querySelectorAll<HTMLElement>('[role=tab]')][3]);
    expect(navigate).toHaveBeenCalledWith([], { queryParams: { estado: 'locales', page: null }, queryParamsHandling: 'merge' });
    fixture.componentRef.setInput('estado', 'locales');
    await settle();
    expect(el().textContent).toContain('Empresa 1 · Luque');
    await click(button('Aprobar'));
    expect(offices.approve).toHaveBeenCalledWith(8);
  });

  it('cargos: aprobar, rechazar y eliminar con confirmación, y agregar sin vacíos', async () => {
    await open(JobsAdmin);
    expect(el().querySelector('#propuestos')?.textContent).toContain('1');
    await click(button('Aprobar'));
    expect(jobs.approve).toHaveBeenCalledWith(2);
    await click(el().querySelector<HTMLElement>('[aria-label="Eliminar Cajera"]')!);
    await click(button('Sí, eliminar'));
    expect(jobs.remove).toHaveBeenCalledWith(1);
    const submit = async () => {
      el().querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      await settle();
    };
    await submit();
    expect(jobs.create).not.toHaveBeenCalled();
    const field = el().querySelector<HTMLInputElement>('#cargo')!;
    expect(field.getAttribute('aria-invalid')).toBe('true');
    field.value = ' Repositor ';
    field.dispatchEvent(new Event('input'));
    await submit();
    expect(jobs.create).toHaveBeenCalledWith('Repositor');
  });
});

describe('Rutas de administración', () => {
  it('la entrada es Moderación y /admin/locales lleva a su pestaña', async () => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()] });
    TestBed.inject(SessionService).start('cabecera.e30.firma', {
      id: 1, email: 'admin@ejemplo.com', rol: 'administrador', estado: 'activo', fechaConsentimiento: null, fechaCreacion: '2026-11-19T00:00:00Z',
    });
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    await harness.navigateByUrl('/admin');
    expect(router.url).toBe('/admin/moderacion');
    await harness.navigateByUrl('/admin/locales');
    expect(router.url).toBe('/admin/empresas?estado=locales');
    sessionStorage.clear();
  });
});
