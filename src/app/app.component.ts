// src/app/app.component.ts
import { Component } from '@angular/core';
import { Router }    from '@angular/router';
import {
  IonicModule,
  MenuController
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService }        from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    private auth:   AuthService,
    private router: Router,
    public  menu:   MenuController,   // ← make it public so the template can call it
  ) {}

  async logout() {
    await this.auth.signOut();
    await this.menu.close('main-menu');           // close the menu
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
