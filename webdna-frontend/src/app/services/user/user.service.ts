import { Injectable } from '@angular/core';
import { User } from './user';
import 'rxjs/add/operator/toPromise';
import { RequestService } from '../request/request.service';
import { AuthenticationResponse } from '../auth-guard/auth.response';

@Injectable()
export class UserService {
  private usersUrl = ['users'];
  private registerUrl = this.usersUrl.concat('register');

  constructor(private requestService: RequestService) { }

  registerUser(user: User): Promise<AuthenticationResponse> {
    return this.requestService.post(this.registerUrl, user);
  }
}
