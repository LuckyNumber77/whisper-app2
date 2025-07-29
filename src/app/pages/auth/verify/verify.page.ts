// src/app/pages/auth/verify/verify.page.ts
import { Component }    from '@angular/core';
import { Router }       from '@angular/router';

import { IonicModule }  from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

import { AuthService }  from '../../../services/auth.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class VerifyPage {
  code = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async verify() {
    // link phone credential
    await this.auth.verifyPhoneCode(this.code);
    // once verified, send user into the app
    await this.router.navigate(['/home']);
  }
}
