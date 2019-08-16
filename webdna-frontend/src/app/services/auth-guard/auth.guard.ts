import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild } from '@angular/router';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private storageService: StorageService,
    private router: Router) { }

  canActivate() {
    if (this.storageService.loggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  canActivateChild() {
    return true;
  }
}
