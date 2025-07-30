// src/app/pages/auth/phone/phone.page.ts
import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { IonicModule }       from '@ionic/angular';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';

import { auth }              from '../../../firebase';
import { RecaptchaVerifier } from 'firebase/auth';
import { AuthService }       from '../../../services/auth.service';

@Component({
  selector: 'app-phone',
  standalone: true,
  templateUrl: './phone.page.html',
  styleUrls:   ['./phone.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PhonePage implements OnInit {
  phone = '';
  private recaptcha!: RecaptchaVerifier;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Always set up an invisible reCAPTCHA v2 widget
    this.recaptcha = new RecaptchaVerifier(
      auth,                   // Auth instance
      'recaptcha-container',  // container ID in your template
      { size: 'invisible', badge: 'bottomright' }
    );
    this.recaptcha.render();  // no-op in emulator
  }

  async sendCode() {
    try {
      // Delegate to AuthService, which handles mock vs real flows
      await this.authService.sendPhoneVerification(
        this.phone,
        this.recaptcha
      );

      // Navigate to verification page
      await this.router.navigate(['/verify'], { replaceUrl: true });
    } catch (err: any) {
      console.error('SMS verification failed:', err);
      // TODO: show a user-facing toast here
    }
  }

  goBack() {
    this.router.navigate(['/create'], { replaceUrl: true });
  }
}
