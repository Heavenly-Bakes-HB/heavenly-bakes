import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  message = '';
  isError = false;

  login() {

    const data = {
      email: this.email,
      password: this.password
    };

    this.auth.login(data).subscribe({

      next: (res: any) => {

        this.auth.saveToken(res.token);
        this.auth.saveUser(res.user);
        this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        this.message = err?.error?.message || 'Login failed';
        this.isError = true;

      }

    });

  }

}
