// src/app/components/modals/share-location-modal.component.ts
import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-share-location-modal',
  imports: [CommonModule, IonicModule],
  templateUrl: './share-location-modal.component.html',
  styleUrls: ['./share-location-modal.component.scss'],
})
export class ShareLocationModalComponent {
  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
