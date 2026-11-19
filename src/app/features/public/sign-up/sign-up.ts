import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page" aria-labelledby="titulo">
      <h1 id="titulo" class="h1">Creá tu cuenta</h1>
      <p class="body">Solo te pedimos un correo y una contraseña. Tu nombre nunca se muestra.</p>
    </section>
  `,
})
export class SignUp {}
