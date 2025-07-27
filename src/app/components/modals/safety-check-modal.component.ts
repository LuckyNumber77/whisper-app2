import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-safety-check-modal',
  imports: [CommonModule, IonicModule],
  templateUrl: './safety-check-modal.component.html',
  styleUrls: ['./safety-check-modal.component.scss'],
})
export class SafetyCheckModalComponent {
  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
