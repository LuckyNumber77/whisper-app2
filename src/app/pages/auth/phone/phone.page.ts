// src/app/pages/auth/phone/phone.page.ts
import { Component }    from '@angular/core';
import { Router }       from '@angular/router';

import { IonicModule }  from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

import { AuthService }  from '../../../services/auth.service';

@Component({
  selector: 'app-phone',
  templateUrl: './phone.page.html',
  styleUrls: ['./phone.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class PhonePage {
  phone = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async sendCode() {
    // send SMS
    await this.auth.sendPhoneVerification(this.phone);
    // navigate to verification screen
    await this.router.navigate(['/verify']);
  }
}
