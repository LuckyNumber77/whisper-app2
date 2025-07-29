import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SwiperContainer } from 'swiper/element';

interface Slide {
  title: string;
  copy: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit, AfterViewInit {
  @ViewChild('slidesRef', { static: true })
  slidesRef!: ElementRef<SwiperContainer>;

  slides: Slide[] = [
    { title: 'Always on, never in the way.', copy: 'Discreet safety features that stay ready without interrupting your day.' },
    { title: 'Share your steps. Stay connected.',   copy: 'Live location and instant alerts keep your circle in the loop.' },
    { title: 'Custom tools for every moment.',      copy: 'Voice triggers, alerts, and sharing — tailored to fit your life.' },
    { title: 'Confidence, wherever you go.',        copy: 'Whisper helps you act early and move through the world with ease.' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Register the custom elements once
    import('swiper/element/bundle').then(({ register }) => register());
  }

  ngAfterViewInit() {
    // Wait for the Swiper instance to be ready...
    const swiperEl = this.slidesRef.nativeElement;
    // Swiper will emit 'slidechange' events
    swiperEl.swiper.on('slideChange', () => {
      const idx = swiperEl.swiper.activeIndex;
      const last = this.slides.length - 1;
      console.log('SlideChange event, index:', idx);
      if (idx >= last) {
        // tiny delay so the UI finishes
        setTimeout(() => this.router.navigate(['/create']), 50);
      }
    });
  }
}
