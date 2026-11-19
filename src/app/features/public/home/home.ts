import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page" aria-labelledby="titulo">
      <h1 id="titulo" class="h1">Tu experiencia vale</h1>
      <p class="body">Contá cómo es trabajar en tu empresa y buscá información real antes de postularte.</p>
    </section>
  `,
})
export class Home {}
