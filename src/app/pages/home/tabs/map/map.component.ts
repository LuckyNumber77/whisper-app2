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
  // Sheet state: collapsed | half | full (default to 'half' for initial load)
  sheetState: 'collapsed' | 'half' | 'full' = 'half';

  // Contacts array (use actual avatar images or fallback initials)
  contacts = [
    { name: 'Alice', avatarUrl: 'assets/avatars/alice.jpg' },
    { name: 'Bob', avatarUrl: 'assets/avatars/bob.jpg' },
    { name: 'Charlie', avatarUrl: 'assets/avatars/charlie.jpg' },
    // Add more mock data or hook into Firestore later
  ];

  constructor(private modalCtrl: ModalController) {}

  // Cycles through sheet states: collapsed → half → full → collapsed ...
  toggleHalfSheet() {
    if (this.sheetState === 'half') {
      this.sheetState = 'full';
    } else if (this.sheetState === 'full') {
      this.sheetState = 'collapsed';
    } else {
      this.sheetState = 'half';
    }
  }

  // (Optional) For later: startDrag handler stub
  startDrag(event: MouseEvent | TouchEvent) {
    // To be implemented: handle drag/touch events for interactive sheet movement
  }

  // Open Share Location Modal
  async openShareShareLocation() {
    const modal = await this.modalCtrl.create({
      component: ShareLocationModalComponent,
    });
    await modal.present();
  }

  // Open Stand-by Modal
  async openStandBy() {
    const modal = await this.modalCtrl.create({
      component: StandbyModalComponent,
    });
    await modal.present();
  }

  // Open Safety Check Modal
  async openSafetyCheck() {
    const modal = await this.modalCtrl.create({
      component: SafetyCheckModalComponent,
    });
    await modal.present();
  }
}
