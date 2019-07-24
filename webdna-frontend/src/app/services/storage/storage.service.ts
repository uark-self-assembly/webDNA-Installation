import { Injectable } from '@angular/core';
import { User } from '../user/user';
import { tokenNotExpired } from 'angular2-jwt';
import { AuthenticationResponse } from '../auth-guard/auth.response';

@Injectable()
export class StorageService {

    private static TOKEN_KEY = 'webdna_jwt_id';
    private static USER_KEY = 'webdna_user';

    constructor() {}

    set token(token: string) {
        localStorage.setItem(StorageService.TOKEN_KEY, token);
    }

    get token(): string {
        return localStorage.getItem(StorageService.TOKEN_KEY);
    }

    set user(user: User) {
        localStorage.setItem(StorageService.USER_KEY, JSON.stringify(user));
    }

    get user(): User {
        return JSON.parse(localStorage.getItem(StorageService.USER_KEY)) as User;
    }

    public setAuthentication(authentication: AuthenticationResponse) {
        this.token = authentication.token;
        this.user = authentication.user;
    }

    public loggedIn() {
        return tokenNotExpired(StorageService.TOKEN_KEY);
    }

    public logOut() {
        this.clear();
    }

    public clear() {
        localStorage.removeItem(StorageService.TOKEN_KEY);
        localStorage.removeItem(StorageService.USER_KEY);
    }
}
