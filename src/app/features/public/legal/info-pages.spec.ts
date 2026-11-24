import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { INFO_PAGES, InfoPageId } from '../info-page/info-pages';
import { HowWeModerate } from './how-we-moderate';
import { Privacy } from './privacy';
import { Responsibility } from './responsibility';
import { Terms } from './terms';

const COMPONENTS: Record<InfoPageId, Type<unknown>> = { moderacion: HowWeModerate, privacidad: Privacy, terminos: Terms, responsabilidad: Responsibility };
const ids = Object.keys(COMPONENTS) as InfoPageId[];
let fixture: ComponentFixture<unknown>;
const el = () => fixture.nativeElement as HTMLElement;
const text = () => (el().textContent ?? '').replace(/\s+/g, ' ');
const choose = (label: string, within: Element = el()) => {
  [...within.querySelectorAll('label')].find((item) => item.textContent?.trim() === label)!.querySelector('input')!.click();
  fixture.detectChanges();
};
function open(component: Type<unknown>): void {
  fixture = TestBed.createComponent(component);
  fixture.detectChanges();
}

describe('Páginas informativas', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it.each(ids)('%s: cada enlace del índice tiene su sección, en el mismo orden', (id) => {
    open(COMPONENTS[id]);
    const links = [...el().querySelectorAll<HTMLAnchorElement>('.index a')].map((a) => a.getAttribute('href')!.split('#')[1]);
    const sections = [...el().querySelectorAll('article section[id]')].map((section) => section.id);
    expect(links).toEqual(sections);
    expect(links.at(-1)).toBe('preguntas');
  });

  it.each(ids)('%s: sin textos pendientes entre corchetes, y lleva a las otras tres', (id) => {
    open(COMPONENTS[id]);
    expect(text()).not.toMatch(/\[[^\]]+\]/);
    const others = [...el().querySelectorAll('.more a')].map((a) => a.getAttribute('href'));
    expect(others).toEqual(ids.filter((other) => other !== id).map((other) => INFO_PAGES[other].ruta));
  });

  it('cómo moderamos: las etapas cambian el panel y no dicen que el modelo nunca decide', () => {
    open(HowWeModerate);
    expect(el().querySelector('[role=tabpanel]')?.textContent).toContain('Revisión automática');
    expect(text()).not.toContain('no decide solo');
    [...el().querySelectorAll<HTMLElement>('[role=tab]')][2].click();
    fixture.detectChanges();
    expect(el().querySelector('[role=tabpanel]')?.textContent).toContain('nunca quién la escribió');
  });

  it('privacidad: «Ver como» muestra a cada quien lo que ve', () => {
    open(Privacy);
    const row = (name: string) => [...el().querySelectorAll('.sample dl > div')].find((item) => item.textContent?.includes(name))!.textContent!;
    expect(row('Tu correo')).toContain('Oculto');
    expect(row('Fecha y hora de envío')).toContain('Oculto');
    choose('Moderación');
    expect(row('Tu correo')).toContain('Oculto');
    expect(row('Fecha y hora de envío')).toContain('23/11/2026');
    choose('Vos');
    expect(row('Tu correo')).toContain('persona@ejemplo.com');
    // El nombre no se pide: no lo ve nadie.
    expect(row('Tu nombre')).toContain('No lo pedimos');
  });

  it('privacidad: no se pierde nada del texto legal y suma el borrador', () => {
    open(Privacy);
    for (const part of ['Anthropic', '3 reseñas o más', '18 años', 'Universidad Nacional de Caaguazú', '7593/2025', 'huella del texto', 'el borrador de una reseña sin enviar', 'Limita los intentos']) {
      expect(text()).toContain(part);
    }
  });

  it('términos: las 7 reglas, y el juego explica la respuesta en las dos opciones', () => {
    open(Terms);
    expect(el().querySelectorAll('ol > li').length).toBe(7);
    const [first, second] = [...el().querySelectorAll('.quiz')];
    expect(first.querySelector('[role=status]')?.textContent?.trim()).toBe('');
    choose('Se publica', first);
    expect(first.textContent).toContain('Coincidimos.');
    choose('Se publica', second);
    expect(second.textContent).toContain('Esta vez no coincidimos.');
    expect(second.textContent).toContain('No se publica: nombra a una persona');
    choose('No se publica', second);
    expect(second.textContent).toContain('Coincidimos.');
  });

  it('responsabilidad: no promete un plazo de respuesta', () => {
    open(Responsibility);
    expect(el().querySelectorAll('ol > li').length).toBe(4);
    expect(text()).not.toMatch(/\d+ (horas|días)/);
  });

  it('el índice marca la sección de la URL', async () => {
    TestBed.inject(Router).resetConfig([{ path: 'terminos', component: Terms }]);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/terminos#probar');
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('.index [aria-current]')?.textContent).toContain('¿Se publicaría?');
  });
});
