import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-companies-directory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page" aria-labelledby="titulo">
      <h1 id="titulo" class="h1">Empresas</h1>
      <p class="body">Buscá una empresa y mirá qué cuentan quienes trabajan ahí.</p>
    </section>
  `,
})
export class CompaniesDirectory {}
