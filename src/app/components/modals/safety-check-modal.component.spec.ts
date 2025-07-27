import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SafetyCheckModalComponent } from './safety-check-modal.component';

describe('SafetyCheckModalComponent', () => {
  let component: SafetyCheckModalComponent;
  let fixture: ComponentFixture<SafetyCheckModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SafetyCheckModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SafetyCheckModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
