// src/app/pages/auth/welcome/welcome.page.ts
import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [
    IonContent,     // for <ion-content>
    IonIcon,        // for <ion-icon> in social buttons
    CommonModule,   // for *ngIf, *ngFor, etc.
    FormsModule     // if you ever bind form controls here
  ]
})
export class WelcomePage implements OnInit {
  constructor(private router: Router) {}
  ngOnInit() {}

  goToSignup()        { this.router.navigate(['/onboarding']); }
  goToLogin()         { this.router.navigate(['/login']); }
  signInWithGoogle()  { console.log('Google sign-in clicked'); }
  signInWithFacebook(){ console.log('Facebook sign-in clicked'); }
  signInWithApple()   { console.log('Apple sign-in clicked'); }
}
