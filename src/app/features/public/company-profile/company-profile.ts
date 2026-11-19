import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-company-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page" aria-labelledby="titulo">
      <h1 id="titulo" class="h1">Perfil de la empresa</h1>
      <p class="body">Acá vas a ver los datos de la empresa, sus locales y sus reseñas.</p>
    </section>
  `,
})
export class CompanyProfile {}
