import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sign-in',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page" aria-labelledby="titulo">
      <h1 id="titulo" class="h1">Ingresá a tu cuenta</h1>
      <p class="body">Ingresá con tu correo para escribir o editar tus reseñas.</p>
    </section>
  `,
})
export class SignIn {}
