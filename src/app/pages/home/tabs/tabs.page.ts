// src/app/pages/home/tabs/tabs.page.ts
import { Component }                from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';
import { RouterModule }             from '@angular/router';
import { CommonModule }             from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA }   from '@angular/core';
import { SheetStateService }        from '../../../services/sheet-state.service';

// 1) Import your standalone header:
import { AppHeaderComponent }       from '../../../components/app-header/app-header.component';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    IonicModule,
    RouterModule,
    CommonModule,
    AppHeaderComponent       // ← register it here
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {
  constructor(
    private sheetState: SheetStateService,
    private menu: MenuController            // ← inject MenuController for side‐menu
  ) {}

  // 2) Handler for the header’s menuToggle event
  onMenuToggle() {
    this.menu.toggle();    // or your custom side‐nav logic
  }

  onShowSheet(type: 'contacts' | 'alerts') {
    this.sheetState.show(type);
  }

  onSOS() {
    alert('SOS triggered!');
  }

  onMapTab() {
    this.sheetState.hide();
  }
}
