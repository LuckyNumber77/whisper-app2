// src/app/pages/home/tabs/map/map.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

import { ShareLocationModalComponent } from '@components/modals/share-location-modal.component';  // Alias fix
import { StandbyModalComponent } from '@components/modals/standby-modal.component';  // Alias fix
import { SafetyCheckModalComponent } from '@components/modals/safety-check-modal.component';  // Alias fix

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {
  isHalfOpen = true;
  isFullOpen = false;

  contacts = [
    { name: 'Alice', avatarUrl: 'assets/avatars/alice.jpg' },
    { name: 'Bob', avatarUrl: 'assets/avatars/bob.jpg' },
    { name: 'Charlie', avatarUrl: 'assets/avatars/charlie.jpg' },
    // Add more mock data or hook into Firestore later
  ];

  constructor(private modalCtrl: ModalController) {}

  toggleHalfSheet() {
    if (this.isHalfOpen) {
      this.isFullOpen = true;
      this.isHalfOpen = false;
    } else if (this.isFullOpen) {
      this.isHalfOpen = false;
      this.isFullOpen = false;
    } else {
      this.isHalfOpen = true;
    }
  }

  async openShareShareLocation() {
    const modal = await this.modalCtrl.create({
      component: ShareLocationModalComponent,
    });
    await modal.present();
  }

  async openStandBy() {
    const modal = await this.modalCtrl.create({
      component: StandbyModalComponent,
    });
    await modal.present();
  }

  async openSafetyCheck() {
    const modal = await this.modalCtrl.create({
      component: SafetyCheckModalComponent,
    });
    await modal.present();
  }
}