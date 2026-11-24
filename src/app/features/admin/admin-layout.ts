import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Marco de la administración. La navegación está en el encabezado `admin` (core/layout/admin-nav). */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page"><router-outlet /></div>`,
})
export class AdminLayout {}
