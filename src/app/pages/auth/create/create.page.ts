// src/app/pages/auth/create/create.page.ts
import { Component }      from '@angular/core';
import { Router }         from '@angular/router';
import { IonicModule }    from '@ionic/angular';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { AuthService }    from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class CreatePage {
  firstName       = '';
  lastName        = '';
  email           = '';
  password        = '';
  confirmPassword = '';

  constructor(
    private auth: AuthService,
    private profile: ProfileService,
    private router: Router
  ) {}

  /** Called when the form is submitted */
  async onSubmit() {
    if (this.password !== this.confirmPassword) {
      console.warn('Passwords do not match');
      return;
    }

    try {
      console.log('1️⃣ Calling signUp…');
      await this.auth.signUp(this.email, this.password);
      console.log('✅ signUp succeeded');

      console.log('2️⃣ Saving profile…');
      await this.profile.saveProfile({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email
      });
      console.log('✅ profile saved');

      console.log('3️⃣ Navigating to /phone');
      const navigated = await this.router.navigate(['/phone']);
      console.log('➡️ navigation returned', navigated);
    } catch (err: any) {
      console.error('🔥 onSubmit error:', err);
    }
  }

  /** “Already have an account? Log In” */
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
