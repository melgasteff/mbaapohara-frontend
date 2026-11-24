import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Home, SEARCH_EXAMPLES } from './home';

describe('Inicio', () => {
  let fixture: ComponentFixture<Home>;
  let el: HTMLElement;
  const input = () => el.querySelector<HTMLInputElement>('#buscar')!;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    fixture = TestBed.createComponent(Home);
    el = fixture.nativeElement as HTMLElement;
  });
  afterEach(() => vi.useRealTimers());

  async function ready(): Promise<void> {
    TestBed.tick();
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/companies/facets'))
      .flush({ ciudades: { total: 3, opciones: [{ id: 12, nombre: 'Coronel Oviedo', idDepartamento: 5, cantidad: 2 }] } });
    await fixture.whenStable();
  }

  it('el ejemplo rota cada 3 s mientras el campo está vacío y sin foco', async () => {
    await ready();
    expect(input().placeholder).toBe(SEARCH_EXAMPLES[0]);
    vi.advanceTimersByTime(3000);
    await fixture.whenStable();
    expect(input().placeholder).toBe(SEARCH_EXAMPLES[1]);

    input().dispatchEvent(new Event('focus'));
    vi.advanceTimersByTime(9000);
    await fixture.whenStable();
    expect(input().placeholder).toBe(SEARCH_EXAMPLES[1]);

    input().dispatchEvent(new Event('blur'));
    input().value = 'banco';
    input().dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(9000);
    await fixture.whenStable();
    expect(input().placeholder).toBe(SEARCH_EXAMPLES[1]);
  });

  it('lleva al directorio con la palabra y la ciudad; sin nada, a todas', async () => {
    await ready();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const submit = () => el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    submit();
    expect(navigate).toHaveBeenLastCalledWith(['/empresas'], { queryParams: {} });

    input().value = ' banco ';
    input().dispatchEvent(new Event('input'));
    el.querySelector<HTMLButtonElement>('.mb-frase-lugar')!.click();
    await fixture.whenStable();
    el.querySelectorAll<HTMLElement>('[role=option]')[1].click();
    submit();
    expect(navigate).toHaveBeenLastCalledWith(['/empresas'], { queryParams: { q: 'banco', ciudad: 12 } });
  });

  it('si los conteos fallan, el buscador sigue funcionando', async () => {
    TestBed.tick();
    TestBed.inject(HttpTestingController).expectOne((r) => r.url.endsWith('/companies/facets')).error(new ProgressEvent('error'));
    await fixture.whenStable();
    expect(el.querySelector('.mb-frase-lugar')?.textContent).toContain('cualquier ciudad');
  });

  it('avisa que la cuenta se eliminó solo si se llega desde ahí', async () => {
    await ready();
    expect(el.querySelector('.deleted')).toBeNull();

    const router = TestBed.inject(Router);
    router.resetConfig([{ path: 'inicio', component: Home }]);
    const harness = await RouterTestingHarness.create();
    await router.navigate(['/inicio'], { state: { cuentaEliminada: true } });
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('.deleted')?.textContent).toContain('Eliminamos tu cuenta');
    // Al recargar, el estado ya no está.
    expect(TestBed.inject(Location).getState()).toBeNull();
  });
});
