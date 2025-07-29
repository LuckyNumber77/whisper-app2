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
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class LoginPage {
  email    = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async signIn() {
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (e) {
      // TODO: track failed attempts, show error toast, etc.
      console.error('Login failed', e);
    }
  }

  goToForgot() {
    this.router.navigate(['/forgot']);
  }
}
