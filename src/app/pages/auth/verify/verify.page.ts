// src/app/pages/auth/verify/verify.page.ts
import { Component, OnInit } from '@angular/core';
import { IonicModule }        from '@ionic/angular';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { Router }             from '@angular/router';

import { AuthService }        from '../../../services/auth.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  templateUrl: './verify.page.html',     // ← make sure this line is present
  styleUrls:   ['./verify.page.scss'],   // ← and this one too
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class VerifyPage implements OnInit {
  code = '';
  private verificationId = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const data = sessionStorage.getItem('confirmationResult');
    if (!data) {
      this.router.navigate(['/phone']);
      return;
    }
    this.verificationId = JSON.parse(data).verificationId;
  }

  async onSubmit() {
    try {
      await this.auth.verifyPhoneCode(this.verificationId, this.code);
      await this.router.navigate(['/home']);
    } catch (err: any) {
      console.error('Verification failed:', err);
    }
  }
}
