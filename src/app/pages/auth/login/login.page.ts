// src/app/pages/auth/login/login.page.ts
import { Component }    from '@angular/core';
import { Router }       from '@angular/router';

import { IonicModule }  from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

import { AuthService }  from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  email    = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  /** Attempt to sign in with email/password */
  async signIn() {
    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: any) {
      console.error('Login failed', e);
      // TODO: show an error toast/toastController.present(...)
    }
  }

  /** Navigate to Forgot Password flow */
  goToForgot() {
    this.router.navigate(['/forgot']);
  }

  /** Navigate to Create Account flow */
  goToCreate() {
    this.router.navigate(['/create']);
  }
}
