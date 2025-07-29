// src/app/pages/auth/forgot/forgot/forgot.page.ts
import { Component }    from '@angular/core';
import { Router }       from '@angular/router';

import { IonicModule }  from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

import { AuthService }  from '../../../../services/auth.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class ForgotPage {
  email = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async sendResetLink() {
    if (!this.email) {
      console.warn('Please enter an email');
      return;
    }

    try {
      await this.auth.resetPassword(this.email);
      // maybe show a toast here…
      console.log('Password reset email sent');
      // navigate back to login
      await this.router.navigate(['/login']);
    } catch (e) {
      console.error('Error sending reset email', e);
      // handle/display error
    }
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}
