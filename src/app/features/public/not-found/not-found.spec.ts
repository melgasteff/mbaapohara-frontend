import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from '../../../app';
import { routes } from '../../../app.routes';

describe('Página no encontrada', () => {
  async function open(url: string) {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    await fixture.whenStable();
    return { el: fixture.nativeElement as HTMLElement, router };
  }

  it('una ruta que no existe conserva su dirección y muestra la página, con un solo buscador', async () => {
    const { el, router } = await open('/no-existe/nada');
    expect(router.url).toBe('/no-existe/nada');
    expect(el.querySelector('h1')?.textContent).toContain('se nos voló');
    expect(el.querySelectorAll('[role=search]').length).toBe(1);
    expect(el.querySelector('footer')?.textContent).toContain('Responsabilidad por las reseñas');
  });

  it('busca en el directorio', async () => {
    const { el, router } = await open('/no-existe');
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const submit = () => el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    submit();
    expect(navigate).toHaveBeenLastCalledWith(['/empresas'], { queryParams: {} });
    el.querySelector('input')!.value = ' banco ';
    submit();
    expect(navigate).toHaveBeenLastCalledWith(['/empresas'], { queryParams: { q: 'banco' } });
  });
});
