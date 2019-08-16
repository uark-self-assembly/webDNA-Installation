/*************************************************
AuthenticationService

Validates user information on login and keeps a
user logged in while they still have their JWT
*************************************************/

import { Injectable } from '@angular/core';
import { AuthenticationResponse } from './auth.response';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { RequestService } from '../request/request.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AuthenticationService {
  private loginUrl = ['users', 'login'];

  constructor(
    private requestService: RequestService,
    private storageService: StorageService) { }

  /********************************************************
  **  authenticateUser(user:User)
  **
  **  Sends username and password to API to authenticate
  ********************************************************/
  authenticateUser(username: string, password: string): Promise<AuthenticationResponse> {
    const body = {
      'username': username,
      'password': password
    }

    return this.requestService.post(this.loginUrl, body)
      .then((response: AuthenticationResponse) => {
        if (typeof response !== 'string') {
          const authentication = response as AuthenticationResponse;
          this.storageService.setAuthentication(authentication);
        }

        return response;
      });
  }
}
