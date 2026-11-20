import { ChangeDetectionStrategy, Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideMenu, LucideSearch, LucideX } from '@lucide/angular';
import { Logo } from '../../../shared/brand/logo/logo';
import { SessionService } from '../../auth/session.service';

/**
 * Encabezado del manual de marca (docs/marca/components/Encabezado).
 * En móvil el buscador baja a una segunda fila y la navegación pasa a un menú.
 */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, Logo, LucideSearch, LucideMenu, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Sin encapsulación para poder ajustar el logo (otro componente); todo va bajo .site-header.
  encapsulation: ViewEncapsulation.None,
  styleUrl: './site-header.css',
  templateUrl: './site-header.html',
  host: { '(document:keydown.escape)': 'closeMenu()' },
})
export class SiteHeader {
  private readonly router = inject(Router);
  protected readonly session = inject(SessionService);
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected signOut(): void {
    this.closeMenu();
    this.session.end();
    this.router.navigate(['/']);
  }

  protected search(event: Event, term: string): void {
    event.preventDefault();
    const q = term.trim();
    this.closeMenu();
    this.router.navigate(['/empresas'], { queryParams: q ? { q } : {} });
  }
}
