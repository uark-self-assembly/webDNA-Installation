import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { AuthGuard } from '../../services/auth-guard/auth.guard';
import { VisualizerComponent } from '../visualizer/visualizer.component';

export const DashboardRoutes: Routes = [{
    path: '',
    children: [{
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'visualizer',
        component: VisualizerComponent,
        canActivate: [AuthGuard]
    }]
}];
