import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService }                               from '../../services/auth.service';
import { HttpClient }                                from '@angular/common/http';

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
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit {
  firstName = '';
  address   = 'Loading location…';

  @Output() menuToggle = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private http:        HttpClient
  ) {}

  ngOnInit() {
    // 1) Pull the user’s first name via getAuthState()
    this.authService.getAuthState()
      .then(user => {
        if (user?.displayName) {
          this.firstName = user.displayName.split(' ')[0];
        }
      })
      .catch(() => {
        this.firstName = '';
      });

    // 2) Geolocate + reverse-geocode
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => this.reverseGeocode(pos.coords.latitude, pos.coords.longitude),
        ()   => this.address = 'Location unavailable'
      );
    } else {
      this.address = 'Geolocation unsupported';
    }
  }

  private reverseGeocode(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse`
      + `?lat=${lat}&lon=${lon}&format=json`;
    this.http
      .get<NominatimResponse>(url, { headers: { 'Accept-Language': 'en' } })
      .subscribe({
        next: res => {
          const addr = res.address;
          const locality = addr.city ?? addr.town ?? addr.village ?? '';
          this.address = [locality, addr.state, addr.country]
            .filter(Boolean)
            .join(', ');
        },
        error: () => {
          this.address = 'Unable to fetch address';
        }
      });
  }

  onMenu() {
    this.menuToggle.emit();
  }
}
