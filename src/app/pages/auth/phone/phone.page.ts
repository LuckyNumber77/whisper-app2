// src/app/pages/auth/phone/phone.page.ts
import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { IonicModule }       from '@ionic/angular';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';

// Import RecaptchaVerifier and Auth from firebase/auth
import { RecaptchaVerifier, Auth, signInWithPhoneNumber } from 'firebase/auth';
// Import the Firebase Auth instance
import { auth } from '../../../firebase';


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
export class PhonePage implements OnInit {
  phone = '';
  private recaptcha!: RecaptchaVerifier;

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.recaptcha = new RecaptchaVerifier(
      auth,                     // Auth instance
      'recaptcha-container',    // container ID
      { size: 'invisible' }     // options
    );
    this.recaptcha.render();
  }


  async sendCode() {
    try {
      // Send the verification SMS
      const confirmation = await signInWithPhoneNumber(
        auth,
        this.phone,
        this.recaptcha
      );

      // Store the confirmation result in sessionStorage for the verify page
      sessionStorage.setItem(
        'confirmationResult',
        JSON.stringify({
          verificationId: confirmation.verificationId
        })
      );

      // Navigate to the verify page
      await this.router.navigate(['/verify']);
    } catch (err) {
      console.error('SMS verification failed:', err);
    }
  }
}
