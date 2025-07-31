// src/app/components/app-header/app-header.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { IonicModule }       from '@ionic/angular';
import { HttpClient }        from '@angular/common/http';
import { take }              from 'rxjs/operators';

import { ProfileService, Profile } from '../../services/profile.service';

interface NominatimResponse {
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit {
  firstName = '';
  address   = 'Loading location…';

  constructor(
    private profileSvc: ProfileService,
    private http:       HttpClient
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.getLocation();
  }

  /** 1) Load firstName from Firestore profile (single-emission) */
  private loadUserData() {
    this.profileSvc.getProfile()
      .pipe(take(1))
      .subscribe({
        next: (profile: Profile) => {
          this.firstName = profile.firstName || '';
        },
        error: () => {
          this.firstName = 'User';
        }
      });
  }

  /** 2) Kick off geolocation → reverse-geocode */
  private getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => this.reverseGeocode(pos.coords.latitude, pos.coords.longitude),
        ()  => this.address = 'Location unavailable'
      );
    } else {
      this.address = 'Geolocation unsupported';
    }
  }

  /** 3) Call Nominatim to turn coords into userCountry, Province */
  private reverseGeocode(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse`
      + `?lat=${lat}&lon=${lon}&format=json`;

    this.http
      .get<NominatimResponse>(url, { headers: { 'Accept-Language': 'en' } })
      .subscribe({
        next: res => {
          const a = res.address;
          const locality = a.city ?? a.town ?? a.village ?? '';
          this.address = [locality, a.state, a.country]
            .filter(Boolean)
            .join(', ');
        },
        error: () => {
          this.address = 'Unable to fetch address';
        }
      });
  }
}
