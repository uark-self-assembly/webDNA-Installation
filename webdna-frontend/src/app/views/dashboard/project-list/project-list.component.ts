import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Project } from '../../../services/project/project';
import { ProjectService } from '../../../services/project/project.service';
import { Observable } from 'rxjs/Observable';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Subscription } from 'rxjs/Subscription';
import { ProjectPage } from '../dashboard.component';
import { StorageService } from '../../../services/storage/storage.service';
import { User } from '../../../services/user/user';
import { MatDialog } from '@angular/material/dialog';
import { ProjectAddDialogComponent } from './project-add-dialog/project-add-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.css']
})

export class ProjectListComponent implements OnInit, OnDestroy {
    @Input()
    public projectClicked: (project: Project) => void;

    @Input()
    currentPage: ProjectPage;

    projects: Project[];

    deleteClicked = ((project: Project) => {
        this.projectService.deleteProject(project).then(deleted => {
            if (deleted) {
                this.projects = this.projects.filter((p) => p.id !== project.id);
                this.showSnackBar('"' + project.name + '" deleted');
            } else {
                console.log('could not delete project');
            }
        });
    }).bind(this);

    duplicateClicked = ((project: Project) => {
        this.projectService.duplicateProject(project.id).then(response => {
            this.insertProjectAtBeginning(response);
        });
    }).bind(this);

    get user(): User {
        return this.storageService.user;
    }

    private projectsTimer: Observable<number>;
    private projectsSubscription: Subscription;

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private storageService: StorageService,
        private projectService: ProjectService) { }

    ngOnInit() {
        this.projectsTimer = TimerObservable.create(0, 5000);
        this.projectsSubscription = this.projectsTimer.subscribe(_ => {
            if (this.currentPage === ProjectPage.TABLE) {
                this.refreshAllProjects();
            }
        });
    }

    ngOnDestroy() {
        this.projectsSubscription.unsubscribe();
    }

    showSnackBar(message: string) {
        this.snackBar.open(message, null, {
            duration: 2000
        });
    }

    refreshAllProjects() {
        this.projectService.getProjects().then(response => {
            if (typeof response === 'string') {
                console.log(response);
            } else {
                this.projects = response as Project[];
            }
        });
    }

    insertProjectAtBeginning(project: Project) {
        this.projects.unshift(project);
        const tempProjects = this.projects;
        this.projects = new Array<Project>();
        tempProjects.forEach(p => this.projects.push(p));
    }

    createProject(name: string) {
        if (!name || name === '') {
            return;
        }

        const project = new Project();
        project.name = name;
        project.user = this.user.id;

        this.projectService.createProject(project).then(response => {
            if (typeof response === 'string') {
                console.log(response);
            } else {
                this.showSnackBar('New project "' + name + '" created');
                this.insertProjectAtBeginning(response);
            }
        });
    }

    addProjectClicked() {
        const dialogRef = this.dialog.open(ProjectAddDialogComponent, {
            width: '300px',
            data: {
                name: ''
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.createProject(result);
            }
        });
    }
}
