// src/app/pages/home/tabs/tabs.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SheetStateService } from 'src/app/services/sheet-state.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TabsPage {
  constructor(private sheetState: SheetStateService) {}

  onShowSheet(type: 'contacts' | 'alerts') {
    this.sheetState.show(type);
  }

  onSOS() {
    // For now, just show a simple alert (replace with modal or SOS action later)
    alert('SOS triggered!');
  }

  onMapTab() {
    // Hides the sheet if user re-selects Map tab
    this.sheetState.hide();
  }
}
