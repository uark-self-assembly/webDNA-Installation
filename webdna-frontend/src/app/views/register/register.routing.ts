import { Routes } from '@angular/router';

import { RegisterComponent } from './register.component';

export const RegisterRoutes: Routes = [{
    path: '',
    children: [ {
        path: 'register',
        component: RegisterComponent
    }]
}];
