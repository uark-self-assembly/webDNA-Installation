import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthLayoutComponent } from './views/layout/auth/auth-layout.component';
import { PageNotFoundComponent } from './views/page-not-found.component';
import { DashboardLayoutComponent } from './views/layout/dashboard/dashboard-layout.component';

export const AppRoutes: Routes = [
    { path: '', redirectTo: '/register', pathMatch: 'full' },
    {
        path: '',
        component: AuthLayoutComponent,
        children: [{
            path: '',
            loadChildren: './views/login/login.module#LoginModule',
        }]
    },
    {
        path: '',
        component: AuthLayoutComponent,
        children: [{
            path: '',
            loadChildren: './views/register/register.module#RegisterModule',
        }]
    },
    {
        path: '',
        component: DashboardLayoutComponent,
        children: [{
            path: '',
            loadChildren: './views/dashboard/dashboard.module#DashboardModule'
        },
        { path: '**', component: PageNotFoundComponent }]
    }];

@NgModule({
    imports: [RouterModule.forRoot(AppRoutes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
