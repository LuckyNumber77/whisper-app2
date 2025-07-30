// src/app/services/auth.service.ts
// ----------------------------------------------
// AuthService: Handles user authentication flows
// - Email/password sign-up & login
// - Password reset & logout
// - Phone/SMS verification & linking
// ----------------------------------------------
import { Injectable, OnDestroy } from '@angular/core';
import { auth }                   from '../firebase';
import { environment }            from '../../environments/environment';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile as fbUpdateProfile,
  UserCredential,
  User
} from 'firebase/auth';

/** Profile fields updatable after account creation */
interface ProfileUpdate {
  displayName?: string | null;
  photoURL?:    string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  // ------------------------------------------------
  // Public: expose auth instance for RecaptchaVerifier
  public authInstance = auth;

  // ------------------------------------------------
  // Private state for storing the in-progress SMS flow
  private confirmationResult: ConfirmationResult | null = null;
  public lastPhoneNumber = '';

  constructor() {
    if (environment.useEmulators) {
      try {
        // Connect to the Auth emulator synchronously
        connectAuthEmulator(
          this.authInstance,
          'http://127.0.0.1:9099',
          { disableWarnings: true }
        );
      } catch (e: any) {
        console.warn('Could not connect to Auth emulator:', e.message);
      }
    }
  }

  // ----------------------------------------------
  // Email/Password Methods
  // ----------------------------------------------

  /** Create a new user with email & password */
  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      return await createUserWithEmailAndPassword(this.authInstance, email, password);
    } catch (err: any) {
      throw this.transformAuthError(err);
    }
  }

  /** Sign in existing user with email & password */
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.authInstance, email, password);
    } catch (err: any) {
      throw this.transformAuthError(err);
    }
  }

  /** Send password reset email */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.authInstance, email);
    } catch (err: any) {
      throw this.transformAuthError(err);
    }
  }

  /** Sign out the current user */
  async signOut(): Promise<void> {
    try {
      await fbSignOut(this.authInstance);
    } catch (err: any) {
      throw this.transformAuthError(err);
    }
  }

  /** Delete the current user account */
  async deleteAccount(): Promise<void> {
    const user = this.authInstance.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      await user.delete();
      await fbSignOut(this.authInstance);
    } catch (err: any) {
      throw this.transformAuthError(err);
    }
  }

  // ----------------------------------------------
  // Phone/SMS Verification Methods
  // ----------------------------------------------

  /**
   * Start phone verification flow.
   * @param phone    E.164 phone number
   * @param verifier RecaptchaVerifier from the page
   */
    async sendPhoneVerification(
      phone:    string,
      verifier: RecaptchaVerifier
    ): Promise<void> {
      this.confirmationResult = null;
      this.lastPhoneNumber    = phone;

      try {
        // Always use the real reCAPTCHA verifier—emulator ignores it
        this.confirmationResult = await signInWithPhoneNumber(
          this.authInstance,
          phone,
          verifier
        );
      } catch (err: any) {
        throw this.transformAuthError(err);
      }
    }

  /**
   * Complete the SMS verification by confirming the code.
   * @param code The SMS code entered by user
   */
  async verifyPhoneCode(code: string): Promise<void> {
    if (!this.confirmationResult) {
      throw new Error('No SMS flow in progress. Please request a new code.');
    }
    try {
      await this.confirmationResult.confirm(code);
    } catch (err: any) {
      throw this.transformAuthError(err);
    }
  }

  // ----------------------------------------------
  // Profile Methods
  // ----------------------------------------------

  /** Update display name or profile photo URL */
  async updateProfile(update: ProfileUpdate): Promise<void> {
    const user = this.authInstance.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      await fbUpdateProfile(user, {
        displayName: update.displayName ?? undefined,
        photoURL:    update.photoURL    ?? undefined
      });
    } catch (err: any) {
      throw this.transformAuthError(err);
    }
  }

  // ----------------------------------------------
  // Helpers & Lifecycle
  // ----------------------------------------------

  /** Get the currently-signed-in Firebase user */
  getCurrentUser(): User | null {
    return this.authInstance.currentUser;
  }

  /** Get one-time auth state as a Promise */
  async getAuthState(): Promise<User | null> {
    return new Promise(resolve => {
      const unsub = this.authInstance.onAuthStateChanged(user => {
        unsub();
        resolve(user);
      });
    });
  }

  /** Get the current user's ID token */
  async getIdToken(): Promise<string> {
    const user = this.authInstance.currentUser;
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  }

  /** Map Firebase errors to friendly messages */
  private transformAuthError(err: any): Error {
    const msg = (err?.code || err?.message || '').toString().toLowerCase();

    if (msg.includes('auth/user-not-found'))            return new Error('No account found with this email');
    if (msg.includes('auth/wrong-password'))            return new Error('Incorrect password');
    if (msg.includes('auth/email-already-in-use'))      return new Error('Email already in use');
    if (msg.includes('auth/weak-password'))             return new Error('Password must be at least 6 characters');
    if (msg.includes('auth/invalid-verification-code')) return new Error('Invalid verification code');

    return err instanceof Error ? err : new Error('Authentication error');
  }

  /** Cleanup reCAPTCHA HTML when service is destroyed */
  ngOnDestroy() {
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';
  }
}
