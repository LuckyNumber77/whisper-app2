import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-standby-modal',
  imports: [CommonModule, IonicModule],
  templateUrl: './standby-modal.component.html',
  styleUrls: ['./standby-modal.component.scss'],
})
export class StandbyModalComponent {
  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
