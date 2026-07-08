import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  message = '';
  isError = false;

  register() {
    const data = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.auth.register(data).subscribe({
      next: () => {
        this.message = 'Account created successfully. Please login.';
        this.isError = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.message = err?.error?.message || 'Registration failed';
        this.isError = true;
      }
    });
  }
}
