import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from '../../app';
import { routeData } from './header-variant';

@Component({ template: 'x' })
class Empty {}

describe('Versión del encabezado', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'empresas', component: Empty },
          { path: 'inicio', component: Empty, data: { encabezado: 'inicio' } },
          { path: 'publicar', children: [{ path: '', component: Empty, data: { encabezado: 'foco', tarea: 'Escribir una reseña' } }] },
          { path: 'ingresar', component: Empty, data: { encabezado: 'ninguno' } },
          { path: 'admin', data: { encabezado: 'admin' }, children: [{ path: 'cargos', component: Empty }] },
        ]),
      ],
    }),
  );

  async function open(url: string): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('toma el dato de la ruta más interna que lo tenga', async () => {
    await TestBed.inject(Router).navigateByUrl('/admin/cargos');
    expect(routeData(TestBed.inject(Router).routerState.snapshot.root, 'encabezado')).toBe('admin');
  });

  it('normal: buscador, navegación, un solo botón naranja y pie', async () => {
    const el = await open('/empresas');
    expect(el.querySelector('header [role=search]')).not.toBeNull();
    expect(el.querySelectorAll('header .mb-btn-accent').length).toBe(1);
    expect(el.querySelector('footer')).not.toBeNull();
  });

  it('inicio: sin buscador', async () => {
    const el = await open('/inicio');
    expect(el.querySelector('header [role=search]')).toBeNull();
    expect(el.querySelector('header .mb-btn-accent')).not.toBeNull();
  });

  it('foco: título de la tarea y anonimato, sin navegación ni pie', async () => {
    const el = await open('/publicar');
    expect(el.querySelector('header')?.textContent).toContain('Escribir una reseña');
    expect(el.querySelector('header')?.textContent).toContain('Tu nombre nunca se muestra');
    expect(el.querySelector('header nav')).toBeNull();
    expect(el.querySelector('footer')).toBeNull();
  });

  it('admin: etiqueta y cuenta, sin buscador ni botón naranja', async () => {
    const el = await open('/admin/cargos');
    expect(el.querySelector('.admin-label')?.textContent).toBe('Administración');
    expect(el.querySelector('header .mb-btn-accent')).toBeNull();
    expect(el.querySelector('footer')).toBeNull();
  });

  it('ninguno: sin encabezado ni pie, con el enlace para saltar al contenido', async () => {
    const el = await open('/ingresar');
    expect(el.querySelector('header, footer')).toBeNull();
    expect(el.querySelector('.skip-link')).not.toBeNull();
  });
});
