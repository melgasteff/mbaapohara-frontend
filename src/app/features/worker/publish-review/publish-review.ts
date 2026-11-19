import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-publish-review',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page" aria-labelledby="titulo">
      <h1 id="titulo" class="h1">Escribí tu reseña</h1>
      <p class="body">Contá tu experiencia en cuatro pasos. Tu nombre nunca se muestra.</p>
    </section>
  `,
})
export class PublishReview {}
