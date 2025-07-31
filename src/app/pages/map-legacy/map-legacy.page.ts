// src/app/pages/map-legacy/map-legacy.page.ts
// =============================================================================
// MapLegacyPage – complete implementation (Updated Version)
// =============================================================================

/* ───────────────────────────── 1. Angular / vendor imports ─────────────── */
import { Component, OnInit, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { MenuController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom, filter, retry, Subscription, TeardownLogic } from 'rxjs';
import * as L from 'leaflet';

/* ───────────────────────────── 2. App-level service imports ────────────── */
import { CacheService } from '../../services/cache.service';
import { SaCsvService } from '../../services/sa-csv.service';
import { ZipLookupService } from '../../services/zip-lookup.service';
import { BlockGroupLookupService } from '../../services/block-group-lookup.service';
import { ProfileService } from '../../services/profile.service';
import { SheetStateService } from '../../services/sheet-state.service';

/* ───────────────────────────── 3. Interfaces & types ───────────────────── */
interface Incident {
  id: string;
  category: string;
  display_category: string;
  date: string;
  formattedDate: string;
  lat: number;
  lon: number;
  neighbourhood?: string;
  community_area?: string;
}
interface NeighbourhoodOption {
  value: string;
  label: string;
}

/* ───────────────────────────── 4. Leaflet icons ────────────────────────── */
const crimeIcons: Record<string, L.Icon> = {
  Assault: L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  'Break and Enter': L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  Theft: L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  Other: L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-grey.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};
const customIcon: L.Icon = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -38],
  shadowSize: [48, 48],
});

/* ───────────────────────────── 5. Component metadata ───────────────────── */
@Component({
  selector: 'app-map-legacy',
  standalone: true,
  templateUrl: './map-legacy.page.html',
  styleUrls: ['./map-legacy.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, HttpClientModule, AppHeaderComponent],
})
export class MapLegacyPage implements OnInit, AfterViewInit, OnDestroy {
  /* ───── 5.1  Public reactive state ───────────────────────────────────── */
  map: L.Map | null = null;
  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];
  loading = true;
  selectedFilter = 'all';
  filterOptions = ['all', 'Assault', 'Break and Enter', 'Theft', 'Other'];
  selectedYear = new Date().getFullYear();
  availableYears: number[] = [];
  selectedCity = 'toronto';
  selectedNeighbourhood = 'all';
  neighbourhoodOptions: NeighbourhoodOption[] = [];
  sheetMode: 'none' | 'contacts' | 'alerts' = 'none';
  private sheetSub?: Subscription;

  /* ───── 5.2  Static lookup tables ────────────────────────────────────── */
  private cityNeighbourhoods: Record<string, NeighbourhoodOption[]> = {};
  private cityCenters: Record<string, [number, number]> = {
    toronto: [43.6532, -79.3832],
    chicago: [41.8781, -87.6298],
    atlanta: [33.7488, -84.3877],
    texas: [31.9686, -99.9018],
    dallas: [32.7767, -96.797],
    austin: [30.2672, -97.7431],
    fortworth: [32.7555, -97.3308],
    sanantonio: [29.4241, -98.4936],
  };

  /* ───── 5.3  User location ───────────────────────────────────────────── */
  userLat = 43.6532;
  userLon = -79.3832;

  /* ───── 5.4  Subscriptions holder ────────────────────────────────────── */
  private subscriptions: Subscription[] = [];

  /* ───── 5.5  Constructor ─────────────────────────────────────────────── */
  constructor(
    private http: HttpClient,
    private cache: CacheService,
    private saCsv: SaCsvService,
    private zipSvc: ZipLookupService,
    private bgSvc: BlockGroupLookupService,
    private profileSvc: ProfileService,
    private zone: NgZone,
    private menu: MenuController,
    private sheetState: SheetStateService
  ) {
    const cur = new Date().getFullYear();
    for (let y = cur; y >= cur - 10; y--) this.availableYears.push(y);

    this.sheetSub = this.sheetState.sheetMode$.subscribe(mode => {
      this.sheetMode = mode;
    });

    this.initializeMenu();
  }

  /* ───────────────────────────── 6. Lifecycle hooks ───────────────────── */
  async ngOnInit(): Promise<void> {
    await this.fetchNeighbourhoods('toronto');
    await this.fetchNeighbourhoods('chicago');
    await this.fetchNeighbourhoods('atlanta');
    this.updateNeighbourhoodOptions();
    await this.updateLocationAndMap();

    const resizeSub = new Subscription();
    const handleResize = () => setTimeout(() => this.map?.invalidateSize(), 100);
    window.addEventListener('resize', handleResize);
    resizeSub.add(() => window.removeEventListener('resize', handleResize));
    this.subscriptions.push(resizeSub);

    const mapElement = document.getElementById('map');
    if (mapElement) {
      const observer = new MutationObserver(() => this.map?.invalidateSize());
      observer.observe(mapElement, { attributes: true, childList: true, subtree: true });
      const observerSub = new Subscription(() => observer.disconnect());
      this.subscriptions.push(observerSub);
      console.log('[Lifecycle] MutationObserver attached to #map');
    }

    this.menu.isOpen('main-menu').then(isOpen => {
      console.log('Menu initially:', isOpen ? 'OPEN' : 'CLOSED');
    });
  }

  private async updateLocationAndMap() {
    this.loading = true;
    await this.fetchIncidents();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.sheetSub?.unsubscribe();
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
    console.log('[Lifecycle] Cleaned up subscriptions and map');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const [lat, lon] = this.cityCenters[this.selectedCity];
      this.initializeMap(lat, lon);
      setTimeout(() => this.map?.invalidateSize(), 100);
      console.log('[Lifecycle] ngAfterViewInit completed map init');
    }, 300);
  }

  /* ───────────────────────────── 7. UI-event handlers ─────────────────── */
  onCityChange(city: string): void {
    this.selectedCity = city;
    this.selectedNeighbourhood = 'all';
    this.updateNeighbourhoodOptions();
    const [lat, lon] = this.cityCenters[city];
    this.map?.setView([lat, lon], city === 'texas' ? 6 : 11);
    this.map?.invalidateSize();
    this.updateLocationAndMap();
  }

  onNeighbourhoodChange(nb: string): void {
    this.selectedNeighbourhood = nb;
    const match = this.incidents.find(
      (i) => nb === 'all' || i.neighbourhood === nb || i.community_area === nb
    );
    if (match && this.map) {
      this.map.setView([match.lat, match.lon], 13);
      this.map.invalidateSize();
    }
    this.updateLocationAndMap();
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.updateLocationAndMap();
  }

  onFilterChange(f: string): void {
    this.selectedFilter = f;
    this.applyFilter();
  }

  async onMenuToggle() {
    console.log('Menu toggle initiated');
    
    try {
      // 1. First ensure the menu system is properly enabled
      await this.menu.enable(true, 'main-menu');
      console.log('Menu enabled confirmed');

      // 2. Verify menu exists in DOM
      const menuEl = document.querySelector('ion-menu');
      if (!menuEl) {
        console.error('Menu element not found in DOM');
        return;
      }

      // 3. Debug current state
      const isOpen = await this.menu.isOpen('main-menu');
      console.log('Current menu state:', isOpen ? 'OPEN' : 'CLOSED');

      // 4. Force menu visibility (temporary debug)
      menuEl.style.display = 'block';
      menuEl.style.zIndex = '10000';
      console.log('Forced menu visibility for debugging');

      // 5. Perform toggle with multiple fallbacks
      try {
        await this.menu.toggle('main-menu');
      } catch (toggleErr) {
        console.warn('Standard toggle failed, trying direct open:', toggleErr);
        await (menuEl as any).open();
      }

      // 6. Final verification
      const finalState = await this.menu.isOpen('main-menu');
      console.log('Final menu state:', finalState ? 'VISIBLE' : 'HIDDEN');

      // 7. Add temporary visual indicator
      menuEl.style.border = '2px solid red';
      console.log('Added visual debug border to menu');

    } catch (err) {
      console.error('Full menu toggle failed:', err);
      
      // Ultimate fallback - show alert
      const alert = document.createElement('div');
      alert.textContent = 'Menu system failed - check console';
      alert.style.position = 'fixed';
      alert.style.background = 'red';
      alert.style.color = 'white';
      alert.style.padding = '10px';
      alert.style.zIndex = '99999';
      document.body.appendChild(alert);
      setTimeout(() => alert.remove(), 3000);
    }
  }

  useDeviceLocation(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      this.zone.run(() => {
        this.userLat = pos.coords.latitude;
        this.userLon = pos.coords.longitude;
        this.map?.setView([this.userLat, this.userLon], 13);
        this.map?.invalidateSize();
        this.updateLocationAndMap();
      });
    });
  }

  /* ───────────────────────────── 8. Icon helper ───────────────────────── */
  iconUrl(cat: string): string {
    return (crimeIcons[cat] ?? crimeIcons['Other']).options.iconUrl as string;
  }

  /* ───────────────────────────── 9. Utility helpers ───────────────────── */
  private fmt(s: string): string {
    const d = new Date(s);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }

  private toRad(x: number) { return (x * Math.PI) / 180; }

  private dist(aLat: number, aLon: number, bLat: number, bLon: number) {
    const R = 6371;
    const dLat = this.toRad(bLat - aLat);
    const dLon = this.toRad(bLon - aLon);
    const c =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(aLat)) * Math.cos(this.toRad(bLat)) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  }

  /* ───────────────────────────── 10. Map Display creation / update ────── */
  private initializeMap(lat: number, lon: number): void {
    if (this.map) { this.map.off(); this.map.remove(); }

    console.log('[Map] init', lat, lon);
    this.map = L.map('map', { center: [lat, lon], zoom: 11, zoomControl: false });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    (window as any).__map = this.map;

    const mapElement = document.getElementById('map');
    if (mapElement) {
      const observer = new MutationObserver(() => this.map?.invalidateSize());
      observer.observe(mapElement, { attributes: true, childList: true, subtree: true });
      const observerSub = new Subscription(() => observer.disconnect());
      this.subscriptions.push(observerSub);
    }

    setTimeout(() => {
      this.map && this.map.invalidateSize();
      console.log('[Map] Invalidated size after init; size:', this.map?.getSize());
    }, 400);

    this.updateMap();
  }

  private updateMap(): void {
    if (!this.map) return;

    this.map.eachLayer(l => { if (l instanceof L.Marker) this.map!.removeLayer(l); });

    L.marker([this.userLat, this.userLon], { icon: customIcon })
      .addTo(this.map)
      .bindPopup('📍 You are here');

    this.filteredIncidents.forEach(inc => {
      const icon = crimeIcons[inc.display_category] ?? crimeIcons['Other'];
      const distance = this.dist(this.userLat, this.userLon, inc.lat, inc.lon);
      L.marker([inc.lat, inc.lon], { icon })
        .addTo(this.map!)
        .bindPopup(
          `<strong>${inc.category}</strong><br>${inc.formattedDate}<br>${distance.toFixed(2)} km`
        );
    });

    setTimeout(() => {
      this.map?.invalidateSize();
      console.log('[Map] Invalidated size after update; size:', this.map?.getSize());
    }, 100);
  }

  /* ───────────────────────────── 12. Fetch incidents ──────────────────── */
  private async fetchIncidents() {
    await firstValueFrom(this.zipSvc.ready$.pipe(filter(Boolean)));

    const cacheKey = `${this.selectedCity}-${this.selectedYear}-${this.selectedNeighbourhood}`;
    const cached: Incident[] | null = await this.cache.get(cacheKey);
    if (cached) {
      this.incidents = cached;
      return this.afterFetch();
    }

    try {
      if (this.selectedCity === 'texas') {
        const subs = this.selectedNeighbourhood === 'all'
          ? ['dallas', 'austin', 'fortworth', 'sanantonio']
          : [this.selectedNeighbourhood];

        const results = await Promise.all(
          subs.map((s) => this.fetchSanAntonioIncidents(this.selectedYear, s))
        );
        this.incidents = results.flat();
      } else {
        this.incidents = await this.fetchIncidentsForCity(
          this.selectedCity,
          this.selectedNeighbourhood
        );
      }
      await this.cache.set(cacheKey, this.incidents);
    } catch (err) {
      console.error('[Incidents] fetch error', err);
      this.incidents = [];
    }

    this.afterFetch();
  }

  /* ───────────────────────────── 13. Per-city dispatch ────────────────── */
  private async fetchIncidentsForCity(city: string, nb: string): Promise<Incident[]> {
    switch (city) {
      case 'toronto':  return this.fetchTorontoIncidents(this.selectedYear, nb);
      case 'chicago':  return this.fetchChicagoIncidents(this.selectedYear, nb);
      case 'atlanta':  return this.fetchAtlantaIncidents(this.selectedYear, nb);
      default:         return [];
    }
  }

  /* ───────────────────────────── 14. Fetch – Toronto ──────────────────── */
  private async fetchTorontoIncidents(year: number, nb: string): Promise<Incident[]> {
    let where = `REPORT_YEAR='${year}'`;
    if (nb !== 'all') where += ` AND NEIGHBOURHOOD_140='${nb}'`;

    const url =
      'https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/' +
      'Major_Crime_Indicators_Open_Data/FeatureServer/0/query?where=' +
      encodeURIComponent(where) +
      '&outFields=*&outSR=4326&f=json';

    const res: any = await firstValueFrom(this.http.get(url).pipe(retry(2)));

    return (res.features ?? []).map((f: any) => {
      const a = f.attributes, g = f.geometry;
      const disp =
        a.MCI_CATEGORY === 'Assault'               ? 'Assault' :
        a.MCI_CATEGORY === 'Break and Enter'       ? 'Break and Enter' :
        ['Auto Theft', 'Robbery', 'Theft Over'].includes(a.MCI_CATEGORY) ? 'Theft' :
        'Other';

      return {
        id: String(a.INDEX_),
        category: a.MCI_CATEGORY,
        display_category: disp,
        date: a.OCC_DATE,
        formattedDate: this.fmt(a.OCC_DATE),
        lat: g.y,
        lon: g.x,
        neighbourhood: a.NEIGHBOURHOOD_140,
      };
    });
  }

  /* ───────────────────────────── 15. Fetch – Chicago ──────────────────── */
  private async fetchChicagoIncidents(year: number, nb: string): Promise<Incident[]> {
    let where = `year=${year}`;
    if (nb !== 'all') where += ` AND community_area=${nb}`;

    const url =
      `https://data.cityofchicago.org/resource/ijzp-q8t2.json?$where=${encodeURIComponent(where)}&$limit=50000`;

    const rows: any[] = await firstValueFrom(this.http.get<any[]>(url).pipe(retry(2)));

    return rows
      .filter(r => r.latitude && r.longitude)
      .map(r => ({
        id: r.case_number,
        category: r.primary_type,
        display_category: this.mapCategory(r.primary_type),
        date: r.date,
        formattedDate: this.fmt(r.date),
        lat: +r.latitude,
        lon: +r.longitude,
        neighbourhood: String(r.community_area),
      }));
  }

  /* ───────────────────────────── 16. Fetch – Atlanta ──────────────────── */
  private async fetchAtlantaIncidents(year: number, nb: string): Promise<Incident[]> {
    let where = `RepYear=${year}`;
    if (nb !== 'all') where += ` AND NhoodName='${nb}'`;

    const url =
      'https://services3.arcgis.com/Et5Qfajgiyosiw4d/arcgis/rest/services/' +
      `CrimeDataExport_2_view/FeatureServer/1/query?where=${encodeURIComponent(where)}` +
      '&outFields=*&outSR=4326&f=json';

    const res: any = await firstValueFrom(this.http.get(url).pipe(retry(2)));

    return (res.features ?? []).map((f: any) => {
      const a = f.attributes, g = f.geometry;
      return {
        id: String(a.REPNUMBER),
        category: a.offense_name,
        display_category: this.mapCategory(a.offense_name),
        date: a.offense_start_date,
        formattedDate: this.fmt(a.offense_start_date),
        lat: g.y,
        lon: g.x,
        neighbourhood: a.NhoodName,
      };
    });
  }

  /* ───────────────────────────── 17. Fetch – San Antonio CSV(Texas) ───── */
  private async fetchSanAntonioIncidents(year: number, nb: string): Promise<Incident[]> {
    await firstValueFrom(this.saCsv.ready$.pipe(filter(Boolean)));
    const rows = this.saCsv.query(year, nb);

    return rows.map((r: any) => {
      const lat = parseFloat(r.Latitude);
      const lon = parseFloat(r.Longitude);

      return {
        id: String(r.ID),
        category: r.Offense,
        display_category: this.mapCategory(r.Offense),
        date: r.Date,
        formattedDate: this.fmt(r.Date),
        lat,
        lon,
        neighbourhood: r.Service_Area,
      };
    });
  }

  /* ───────────────────────────── 18. Category normaliser ──────────────── */
  private mapCategory(raw: string): string {
    const c = raw?.toLowerCase() ?? '';
    if (c.includes('assault') || c.includes('battery')) return 'Assault';
    if (c.includes('burglary') || c.includes('break') || c.includes('enter')) return 'Break and Enter';
    if (c.includes('theft') || c.includes('larceny') || c.includes('robbery')) return 'Theft';
    return 'Other';
  }

  /* ───────────────────────────── 19. Neighbourhood look-ups ───────────── */
  private async fetchNeighbourhoods(city: string) {
    const cacheKey = `${city}_neigh`;
    let arr: NeighbourhoodOption[] = await this.cache.get(cacheKey) ?? [];

    if (!arr.length) {
      try {
        if (city === 'toronto') {
          const url =
            'https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/' +
            'Major_Crime_Indicators_Open_Data/FeatureServer/0/query?where=1=1' +
            '&outFields=NEIGHBOURHOOD_140&returnDistinctValues=true&returnGeometry=false&f=json';

          const res: any = await firstValueFrom(this.http.get(url).pipe(retry(2)));
          const uniq = Array.from(new Set(res.features.map((f: any) => f.attributes.NEIGHBOURHOOD_140 as string))).sort();
        }
        else if (city === 'chicago') {
          const url =
            'https://data.cityofchicago.org/resource/igwz-8jzy.json?$select=area_numbe,community&$order=community';
          const data: any[] = await firstValueFrom(this.http.get<any[]>(url).pipe(retry(2)));
          arr = data.map(d => ({ value: String(d.area_numbe), label: d.community }));
        }
        else if (city === 'atlanta') {
          const url =
            'https://services3.arcgis.com/Et5Qfajgiyosiw4d/arcgis/rest/services/' +
            'CrimeDataExport_2_view/FeatureServer/1/query?where=1=1' +
            '&outFields=NhoodName&returnDistinctValues=true&returnGeometry=false&f=json';
          const res: any = await firstValueFrom(this.http.get(url).pipe(retry(2)));
          const uniq = Array.from(new Set(res.features.map((f: any) => f.attributes.NhoodName as string))).sort();
        }

        await this.cache.set(cacheKey, arr);
      } catch (err) {
        console.error(`Neighbourhood fetch error for ${city}`, err);
      }
    }

    this.cityNeighbourhoods[city] = [{ value: 'all', label: 'All' }, ...arr];
  }

  private updateNeighbourhoodOptions() {
    if (this.selectedCity === 'texas') {
      this.neighbourhoodOptions = [
        { value: 'all',       label: 'All' },
        { value: 'dallas',    label: 'Dallas' },
        { value: 'austin',    label: 'Austin' },
        { value: 'fortworth', label: 'Fort Worth' },
        { value: 'sanantonio',label: 'San Antonio' },
      ];
    } else {
      this.neighbourhoodOptions = this.cityNeighbourhoods[this.selectedCity] ?? [];
    }
  }

  /* ───────────────────────────── 20. Post-fetch processing ────────────── */
  private afterFetch() {
    this.applyFilter();
    if (this.filteredIncidents.length && this.map) {
      const bounds = L.latLngBounds(this.filteredIncidents.map(i => [i.lat, i.lon]));
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
    this.loading = false;
    this.updateMap();
  }

  private applyFilter() {
    this.filteredIncidents = this.incidents
      .filter(i => this.selectedFilter === 'all' || i.display_category === this.selectedFilter);
  }

  /* ───────────────────────────── Menu-specific additions ──────────────── */
  private async initializeMenu() {
    try {
      await this.menu.enable(true, 'main-menu');
      const isEnabled = await this.menu.isEnabled('main-menu');
      console.log(`Menu enabled: ${isEnabled}`);
      
      const menus = await this.menu.getMenus();
      console.log('Registered menus:', menus);
    } catch (err) {
      console.error('Menu initialization failed:', err);
    }
  }

  closeSheet() {
    this.sheetState.hide();
  }
}

/* =============================================================================
   End of MapLegacyPage
============================================================================= */