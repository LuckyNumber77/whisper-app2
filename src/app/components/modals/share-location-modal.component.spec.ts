import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShareLocationModalComponent } from './share-location-modal.component';

describe('ShareLocationModalComponent', () => {
  let component: ShareLocationModalComponent;
  let fixture: ComponentFixture<ShareLocationModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ShareLocationModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareLocationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
