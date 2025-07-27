import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StandbyModalComponent } from './standby-modal.component';

describe('StandbyModalComponent', () => {
  let component: StandbyModalComponent;
  let fixture: ComponentFixture<StandbyModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [StandbyModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StandbyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
