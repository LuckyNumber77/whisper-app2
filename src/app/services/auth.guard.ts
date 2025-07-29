// src/app/services/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';  // adjust path if your firebase.ts lives elsewhere

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree
  {
    return new Observable<User | null>(subscriber => {
      const unsubscribe = onAuthStateChanged(
        auth,
        user => {
          subscriber.next(user);
          subscriber.complete();
        },
        err => subscriber.error(err)
      );
      return { unsubscribe };
    }).pipe(
      map(user => {
        if (user) return true;
        return this.router.createUrlTree(['/welcome']);
      })
    );
  }
}
