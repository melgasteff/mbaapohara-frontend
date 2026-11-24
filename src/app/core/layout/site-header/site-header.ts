import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideLock, LucideMenu, LucidePencil, LucideSearch, LucideX } from '@lucide/angular';
import { Logo } from '../../../shared/brand/logo/logo';
import { SessionService } from '../../auth/session.service';
import { AdminNav } from '../admin-nav/admin-nav';
import { FocusExit } from '../focus-exit';
import { HeaderVariant } from '../header-variant';

/**
 * Encabezado, en cuatro versiones que elige la ruta (header-variant.ts). Hasta 1159 px, el buscador, la navegación y
 * el botón pasan a un menú desplegable.
 */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, Logo, AdminNav, LucideLock, LucidePencil, LucideSearch, LucideMenu, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './site-header.css',
  templateUrl: './site-header.html',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class SiteHeader {
  readonly variant = input<HeaderVariant>('normal');
  /** Título de la tarea en la versión «foco». */
  readonly task = input('');

  private readonly router = inject(Router);
  protected readonly session = inject(SessionService);
  protected readonly exit = inject(FocusExit);
  protected readonly menuOpen = signal(false);
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>('toggle');

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** Escape cierra el menú y devuelve el foco a su botón. */
  protected onEscape(): void {
    if (!this.menuOpen()) return;
    this.closeMenu();
    this.toggle()?.nativeElement.focus();
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
