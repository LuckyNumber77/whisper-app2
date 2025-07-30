// src/app/pages/auth/create/create.page.ts
import { Component }        from '@angular/core';
import { Router }           from '@angular/router';
import { IonicModule }      from '@ionic/angular';
import { CommonModule }     from '@angular/common';
import { FormsModule }      from '@angular/forms';

import { AuthService }      from '../../../services/auth.service';

@Component({
  selector: 'app-create',
  standalone: true,
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CreatePage {
  firstName       = '';
  lastName        = '';
  email           = '';
  password        = '';
  confirmPassword = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  /** Called when the form is submitted */
  async onSubmit() {
    if (this.password !== this.confirmPassword) {
      console.warn('Passwords do not match');
      return;
    }

    try {
      // 1️⃣ Sign up to Firebase Auth
      await this.auth.signUp(this.email, this.password);

      // 2️⃣ Temporarily stash the profile info until after phone verify
      sessionStorage.setItem('pendingProfile', JSON.stringify({
        firstName: this.firstName,
        lastName:  this.lastName,
        email:     this.email
      }));

      // 3️⃣ Go to phone verification
      await this.router.navigate(['/phone'], { replaceUrl: true });
    } catch (err: any) {
      console.error('🔥 onSubmit error:', err);
      // TODO: show user-facing error toast
    }
  }

  goToLogin() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
