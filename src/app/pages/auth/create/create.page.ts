// src/app/pages/auth/create/create.page.ts
import { Component }   from '@angular/core';
import { Router }      from '@angular/router';
import { IonicModule } from '@ionic/angular';
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
  firstName      = '';
  lastName       = '';
  email          = '';
  password       = '';
  confirmPassword = '';

  constructor(
    private auth: AuthService,
    private profile: ProfileService,
    private router: Router
  ) {}

  async onSubmit() {
    // simple guard
    if (this.password !== this.confirmPassword) {
      console.warn('Passwords do not match');
      return;
    }

    // 1) Create user with email/password
    await this.auth.signUp(this.email, this.password);

    // 2) Save name/email in Firestore
    await this.profile.saveProfile({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email
    });

    // 3) Navigate to phone entry
    await this.router.navigate(['/phone']);
  }
}
