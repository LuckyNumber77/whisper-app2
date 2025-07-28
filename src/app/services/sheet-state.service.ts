import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type SheetMode = 'none' | 'contacts' | 'alerts';

@Injectable({ providedIn: 'root' })
export class SheetStateService {
  private mode$ = new BehaviorSubject<SheetMode>('none');
  sheetMode$ = this.mode$.asObservable();

  show(mode: SheetMode) {
    this.mode$.next(mode);
  }
  hide() {
    this.mode$.next('none');
  }
}
