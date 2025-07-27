import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

// Services (✅ corrected paths)
import { ProfileService } from 'src/app/services/profile.service';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { CacheService } from 'src/app/services/cache.service';
import { SaCsvService } from 'src/app/services/sa-csv.service';
import { ZipLookupService } from 'src/app/services/zip-lookup.service';

@Component({
  selector: 'app-map-legacy',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './map-legacy.page.html',
  styleUrls: ['./map-legacy.page.scss'],
})
export class MapLegacyPage {
  selectedCity = 'toronto';
  selectedNeighbourhood: string | null = null;
  selectedYear: number = new Date().getFullYear();
  selectedFilter: string | null = null;
  neighbourhoodOptions: any[] = [];
  availableYears: number[] = [];
  filterOptions: string[] = [];
  loading = false;
  filteredIncidents: any[] = [];

  private map: L.Map | null = null;
  private mapInitialized = false;

  constructor(
    private profile: ProfileService,
    private auth: AuthService,
    private storage: StorageService,
    private cache: CacheService,
    private saCsv: SaCsvService,
    private zipLookup: ZipLookupService
  ) {
    this.init();
  }

  async init() {
    await this.initMap();
    // Next: load data, markers, filters, etc.
  }

  private async initMap(): Promise<void> {
    if (this.mapInitialized) return;

    setTimeout(() => {
      this.map = L.map('map', {
        center: [43.65107, -79.347015], // Toronto
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.mapInitialized = true;
    }, 0);
  }

  onCityChange(city: string) {
    // Fetch data for selected city
  }

  onNeighbourhoodChange(value: string) {
    // Filter data for selected neighbourhood
  }

  onYearChange(year: number) {
    // Filter data for selected year
  }

  onFilterChange(filter: string) {
    // Filter data by category
  }

  useDeviceLocation() {
    // Use geolocation to filter incidents
  }

  iconUrl(category: string): string {
    if (category === 'Assault') {
      return 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
    }
    if (category === 'Break and Enter') {
      return 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
    }
    if (category === 'Theft') {
      return 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
    }
    return 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
  }
}
