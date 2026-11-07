import { Component, HostListener, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Signal-based URL tracking using Angular 22 Router API
  protected readonly showBackButton = computed(() => {
    const navigation = this.router.lastSuccessfulNavigation();
    const url = navigation?.finalUrl
      ? this.router.serializeUrl(navigation.finalUrl)
      : this.router.url;
    return url !== '/' && url !== '';
  });

  get user(): User | null {
    return this.authService.currentUser();
  }

  public menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  goTo(path: string): void {
    this.closeMenu();
    this.router.navigate([path]);
  }

  signOut(): void {
    this.closeMenu();
    this.authService.signOut$().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Sign out failed:', error);
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-menu-root]')) {
      this.menuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuOpen = false;
  }
}
