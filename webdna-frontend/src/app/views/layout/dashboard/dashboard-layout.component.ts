import { Component} from '@angular/core';
import { StorageService } from '../../../services/storage/storage.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dashboard-layout',
    templateUrl: './dashboard-layout.component.html',
    styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {
    sideNavOpened = false;

    get currentPath(): string {
        return this.router.url.split('/').pop();
    }

    constructor(private storageService: StorageService, private router: Router) { }

    onLogoutClicked() {
        this.storageService.logOut();
        this.router.navigate(['login']);
    }

    projectsClicked() {
        this.router.navigate(['dashboard']);
        this.sideNavOpened = false;
    }

    visualizerClicked() {
        this.router.navigate(['visualizer']);
        this.sideNavOpened = false;
    }
}
