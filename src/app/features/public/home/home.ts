import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideLock, LucideScale, LucideSearch } from '@lucide/angular';

/** Portada: buscar una empresa o escribir una reseña. */
@Component({
  selector: 'app-home',
  imports: [RouterLink, LucideSearch, LucideArrowRight, LucideLock, LucideScale],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly router = inject(Router);

  protected search(event: Event, term: string): void {
    event.preventDefault();
    const q = term.trim();
    this.router.navigate(['/empresas'], { queryParams: q ? { q } : {} });
  }
}
