// --------------------------------------------------------------
// AuthService: Handles user authentication flows
//  • Email/password sign-up & login
//  • Phone/SMS verification & linking
//  • Password reset, logout, delete account
//  • Utility helpers (getAuthState, getIdToken, etc.)
// --------------------------------------------------------------
import { Injectable, OnDestroy } from '@angular/core';
import { auth }                   from '../firebase';                  // your getAuth() wrapper
import { environment }            from '../../environments/environment';

import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,          // used only for phone-only login
  ConfirmationResult,
  updateProfile as fbUpdateProfile,
  deleteUser,
  UserCredential,
  User,
  PhoneAuthProvider,
  linkWithCredential
} from 'firebase/auth';

/* ---------- optional typings ---------- */
interface ProfileUpdate {
  displayName?: string | null;
  photoURL?:    string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  /* Public so pages can build RecaptchaVerifier */
  public authInstance = auth;

  /* Phone-verification scratch state */
  private confirmationResult: ConfirmationResult | null = null;
  public  lastPhoneNumber = '';

  constructor() {
    /* Connect to Auth emulator if flag enabled */
    if (environment.useEmulators) {
      try {
        connectAuthEmulator(
          this.authInstance,
          'http://127.0.0.1:9099',
          { disableWarnings: true }
        );
      } catch (e: any) {
        console.warn('[Auth] Could not connect to emulator:', e.message);
      }
    }
  }

  // ------------------------------------------------------------------
  // EMAIL-FIRST SIGN-UP THAT LINKS PHONE (ONE UID)
  // ------------------------------------------------------------------
  async signUpWithEmailAndPhone(
    email: string,
    password: string,
    phoneE164: string
  ): Promise<UserCredential> {

    /* a) Create the email account */
    const { user } = await createUserWithEmailAndPassword(
      this.authInstance,
      email,
      password
    );

    /* b) Link the phone so we keep one UID */
    if (environment.useEmulators) {
      // Emulator shortcut – any verificationId & 6-digit code work
      const cred = PhoneAuthProvider.credential(
        'mock-verification-id',
        '000000'
      );
      await linkWithCredential(user, cred);
    } else {
      // Production path – start real SMS flow
      await this.sendPhoneVerification(phoneE164, this.buildRecaptcha());
      // Code will be confirmed in verifyPhoneCode(), which links below
    }

    return { user } as UserCredential;
  }

  // ------------------------------------------------------------------
  // STANDARD EMAIL/PASSWORD METHODS
  // ------------------------------------------------------------------
  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      return await createUserWithEmailAndPassword(this.authInstance, email, password);
    } catch (err: any) {
      throw this.transformAuthError(err);
    }
  }

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.authInstance, email, password);
    } catch (err: any) {
      throw this.transformAuthError(err);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.authInstance, email);
    } catch (err: any) {
      throw this.transformAuthError(err);
    }
  }

  async signOut(): Promise<void> {
    try { await fbSignOut(this.authInstance); }
    catch (err: any) { throw this.transformAuthError(err); }
  }

  async deleteAccount(): Promise<void> {
    const user = this.authInstance.currentUser;
    if (!user) throw new Error('Not authenticated');
    try {
      await deleteUser(user);
      await fbSignOut(this.authInstance);
    } catch (err: any) { throw this.transformAuthError(err); }
  }

  // ------------------------------------------------------------------
  // PHONE / SMS VERIFICATION (USED FOR LINKING OR PHONE-ONLY LOGIN)
  // ------------------------------------------------------------------
  async sendPhoneVerification(
    phone: string,
    verifier: RecaptchaVerifier
  ): Promise<void> {
    this.confirmationResult = null;
    this.lastPhoneNumber    = phone;

    try {
      this.confirmationResult = await signInWithPhoneNumber(
        this.authInstance,
        phone,
        verifier
      );
    } catch (err: any) { throw this.transformAuthError(err); }
  }

  async verifyPhoneCode(code: string): Promise<void> {
    if (!this.confirmationResult) {
      throw new Error('No SMS flow in progress. Please request a new code.');
    }

    const user = this.authInstance.currentUser;
    if (!user) throw new Error('Not authenticated');

    /* Build a credential from the verificationId + code */
    const cred = PhoneAuthProvider.credential(
      this.confirmationResult.verificationId,
      code
    );

    /* LINK it to the already-signed-in user (avoids duplicate UID) */
    await linkWithCredential(user, cred);

    this.confirmationResult = null; // reset
  }

  // ------------------------------------------------------------------
  // PROFILE UPDATES
  // ------------------------------------------------------------------
  async updateProfile(update: ProfileUpdate): Promise<void> {
    const user = this.authInstance.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      await fbUpdateProfile(user, {
        displayName: update.displayName ?? undefined,
        photoURL:    update.photoURL    ?? undefined
      });
    } catch (err: any) { throw this.transformAuthError(err); }
  }

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  getCurrentUser(): User | null { return this.authInstance.currentUser; }

  async getAuthState(): Promise<User | null> {
    return new Promise(resolve => {
      const unsub = this.authInstance.onAuthStateChanged(user => {
        unsub(); resolve(user);
      });
    });
  }

  async getIdToken(): Promise<string> {
    const user = this.authInstance.currentUser;
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  }

  /* Builds an invisible reCAPTCHA verifier (no-op in emulator) */
  private buildRecaptcha(): RecaptchaVerifier {
    return new RecaptchaVerifier(
      this.authInstance,        // 1️⃣ Auth first
      'recaptcha-container',    // 2️⃣ DOM element ID or HTMLElement
      { size: 'invisible' }     // 3️⃣ optional parameters
    );
  }


  private transformAuthError(err: any): Error {
    const msg = (err?.code || err?.message || '').toString().toLowerCase();
    if (msg.includes('auth/user-not-found'))            return new Error('No account found with this email');
    if (msg.includes('auth/wrong-password'))            return new Error('Incorrect password');
    if (msg.includes('auth/email-already-in-use'))      return new Error('Email already in use');
    if (msg.includes('auth/weak-password'))             return new Error('Password must be at least 6 characters');
    if (msg.includes('auth/invalid-verification-code')) return new Error('Invalid verification code');
    return err instanceof Error ? err : new Error('Authentication error');
  }

  ngOnDestroy() {
    const el = document.getElementById('recaptcha-container');
    if (el) el.innerHTML = '';
  }
}
