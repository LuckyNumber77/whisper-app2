// src/app/pages/auth/verify/verify.page.ts
import { Component, OnInit }         from '@angular/core';
import { Router }                    from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule }              from '@angular/common';
import { FormsModule }               from '@angular/forms';

import { AuthService }               from '../../../services/auth.service';
import { ProfileService }            from '../../../services/profile.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  templateUrl: './verify.page.html',
  styleUrls:   ['./verify.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class VerifyPage implements OnInit {
  code = '';

  constructor(
    private auth: AuthService,
    private profile: ProfileService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    // If no SMS flow in progress, send them back to phone entry
    if (!(this.auth as any).confirmationResult) {
      this.router.navigate(['/phone'], { replaceUrl: true });
    }
  }

  /** Called when the user taps “Next” */
  async onSubmit() {
    try {
      // 1️⃣ Verify the SMS code
      await this.auth.verifyPhoneCode(this.code);

      // 2️⃣ Retrieve the stashed profile fields
      const raw = sessionStorage.getItem('pendingProfile');
      if (!raw) throw new Error('Profile info missing—please restart sign-up');
      const { firstName, lastName, email } = JSON.parse(raw);

      // 3️⃣ Save the profile document in Firestore
      await this.profile.saveProfile({ firstName, lastName, email });

      // 4️⃣ Notify the user
      const toast = await this.toastCtrl.create({
        message: 'Profile created successfully!',
        duration: 2000,
        position: 'top'
      });
      await toast.present();
      await toast.onDidDismiss();

      // 5️⃣ Clear the temporary storage
      sessionStorage.removeItem('pendingProfile');

      // 6️⃣ Finally, send them into the app
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (err: any) {
      console.error('Verification or save failed:', err);
      const errorToast = await this.toastCtrl.create({
        message: err.message || 'Verification failed. Please try again.',
        duration: 2000,
        position: 'top'
      });
      await errorToast.present();
    }
  }
}
