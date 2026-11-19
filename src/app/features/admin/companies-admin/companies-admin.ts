import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-companies-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page" aria-labelledby="titulo">
      <h1 id="titulo" class="h1">Administrar empresas</h1>
      <p class="body">Cargá empresas y sus locales.</p>
    </section>
  `,
})
export class CompaniesAdmin {}
