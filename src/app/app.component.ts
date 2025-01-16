import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { DatasourceService } from './services/datasource.service';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'angular-workspace';
  options = ['json', 'firebase', 'server'];
  isLoggedIn = false;
  username: string | null = null;

  constructor(
    private datasourceService: DatasourceService,
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.username = user?.email?.slice(0, user.email.length - 12) || null;
    });
  }

  onSelectChange(event: Event) {
    const selectedOption = (event.target as HTMLSelectElement).value;
    this.datasourceService.setValue(selectedOption);
  }

  onPersistenceChange(event: Event): void {
    const selectedMode = (event.target as HTMLSelectElement).value as
      | 'local'
      | 'session'
      | 'none';
    this.authService
      .setPersistenceMode(selectedMode)
      .catch((error) =>
        console.error('Failed to change persistence mode:', error)
      );
  }

  login() {
    this.router.navigate(['/login']);
  }

  register() {
    this.router.navigate(['/register']);
  }

  logout() {
    this.authService.logout();
  }
}
