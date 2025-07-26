// src/app/pages/home/tabs/map/map.component.ts
import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [],
})
export class MapComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map!: L.Map;

  async ngAfterViewInit() {
    const coords = await Geolocation.getCurrentPosition();
    const { latitude, longitude } = coords.coords;

    this.map = L.map(this.mapContainer.nativeElement).setView(
      [latitude, longitude],
      15
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    L.marker([latitude, longitude])
      .addTo(this.map)
      .bindPopup('You are here')
      .openPopup();
  }
}
