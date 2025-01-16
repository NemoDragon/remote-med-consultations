import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  email = '';
  password = '';
  role = 'patient';

  constructor(private authService: AuthService) {}

  register(email: string, password: string, role: string): void {
    this.authService
      .register(email, password, role)
      .catch((err) => console.error(err));
  }
}
