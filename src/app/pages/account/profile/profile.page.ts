// src/app/pages/account/profile/profile.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import {
  IonicModule,
  NavController,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular';
import { take }                    from 'rxjs/operators';
import { ProfileService, Profile } from '../../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  // match your Firestore Profile interface
  user: {
    firstName: string;
    lastName:  string;
    email:     string;
    phone:     string;
  } = {
    firstName: '',
    lastName:  '',
    email:     '',
    phone:     ''
  };

  isEditing = false;
  originalUserData!: typeof this.user;
  isLoading  = false;

  constructor(
    private profileSvc: ProfileService,
    private nav:        NavController,
    private alertCtrl:  AlertController,
    private toastCtrl:  ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    this.isLoading = true;
    this.profileSvc.getProfile()
      .pipe(take(1))
      .subscribe({
        next: (p: Profile) => {
          this.user = {
            firstName: p.firstName || '',
            lastName:  p.lastName  || '',
            email:     p.email     || '',
            phone:     p.phone     || ''
          };
          this.originalUserData = { ...this.user };
        },
        error: err => {
          console.error('Failed to load profile:', err);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.user = { ...this.originalUserData };
    }
  }

  async saveChanges() {
    const loading = await this.loadingCtrl.create({ message: 'Saving changes...' });
    await loading.present();

    try {
      await this.profileSvc.saveProfile({
        firstName: this.user.firstName,
        lastName:  this.user.lastName,
        phone:     this.user.phone
      });

      this.isEditing = false;
      this.originalUserData = { ...this.user };

      const toast = await this.toastCtrl.create({
        message:  'Profile updated successfully',
        duration: 2000,
        color:    'success',
        position: 'top'
      });
      await toast.present();

    } catch (error) {
      console.error('Profile update error:', error);
      const toast = await this.toastCtrl.create({
        message:  error instanceof Error ? error.message : 'Failed to update profile',
        duration: 3000,
        color:    'danger',
        position: 'top'
      });
      await toast.present();

      this.user = { ...this.originalUserData };

    } finally {
      await loading.dismiss();
    }
  }

  async delete() {
    const alert = await this.alertCtrl.create({
      header:  'Delete Account?',
      message: 'All your data will be permanently deleted. This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text:    'Delete',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Deleting account...' });
            await loading.present();

            try {
              await this.profileSvc.deleteProfile();
              this.nav.navigateRoot('/login');
            } catch (error) {
              console.error('Account deletion failed:', error);
              const toast = await this.toastCtrl.create({
                message:  'Failed to delete account. Please try again.',
                duration: 3000,
                color:    'danger',
                position: 'top'
              });
              await toast.present();
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
