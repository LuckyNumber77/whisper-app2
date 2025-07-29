// src/app/pages/auth/create/create.page.ts
import { Component }    from '@angular/core';
import { Router }       from '@angular/router';
import { IonicModule }  from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

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

  async onSubmit() {
    if (this.password !== this.confirmPassword) {
      console.warn('Passwords do not match');
      return;
    }
    await this.auth.signUp(this.email, this.password);
    await this.profile.saveProfile({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email
    });
    await this.router.navigate(['/phone']);
  }

  /** Navigate to login if the user already has an account */
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
