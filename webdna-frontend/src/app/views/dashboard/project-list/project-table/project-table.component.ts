import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Project, LogResponse } from '../../../../services/project/project';
import { Observable } from 'rxjs/Observable';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Subscription } from 'rxjs/Subscription';
import { ProjectService } from '../../../../services/project/project.service';
import { MatDialog } from '@angular/material/dialog';
import { LogOutputDialogComponent, LogOutputData } from '../../log-output/dialog/log-output-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

export class ProjectRow {
    project: Project;
    starting = false;
    restarting = false;
    downloading = false;

    constructor(project: Project) {
        this.project = project;
    }
}

@Component({
    selector: 'project-table',
    templateUrl: './project-table.component.html',
    styleUrls: ['./project-table.component.css']
})
export class ProjectTableComponent implements OnInit, OnDestroy, AfterViewChecked {
    _projects: Project[];

    @ViewChild('logmodal') logModal;

    @Input()
    projectClicked: (project: Project) => void;

    @Input()
    deleteClicked: (project: Project) => void;

    @Input()
    duplicateClicked: (project: Project) => void;

    @Input()
    set projects(newProjects) {
        if (newProjects) {
            newProjects.forEach(project => {
                project.created_on = new Date(project.created_on);
            });
            this._projects = newProjects;
            this.projectRows = this._projects.map(p => new ProjectRow(p));
        }
        this._projects = newProjects;
        if (this._projects) {
            this.projectRows = this._projects.map(p => new ProjectRow(p));
        }
    }

    get projects() {
        return this._projects;
    }

    private logOpen = false;

    private openedProjectId: string;
    private selectedRow: ProjectRow = null;

    private logData: LogOutputData = { project: null, logHeight: 500, oxDNALog: '', programLog: '' };
    projectRows: ProjectRow[] = [];

    private logTimer: Observable<number>;
    private logSubscription: Subscription;

    constructor(
        private projectService: ProjectService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.logTimer = TimerObservable.create(0, 600);
        this.logSubscription = this.logTimer.subscribe(_ => {
            if (this.selectedRow && this.selectedRow.project.running && this.logOpen) {
                this.updateLogText();
            }
        });
    }

    ngOnDestroy() {
        this.logSubscription.unsubscribe();
    }

    ngAfterViewChecked() {
        this.changeDetectorRef.detectChanges();
    }

    showSnackBar(message: string, duration: number = 2000) {
        this.snackBar.open(message, null, {
            duration: duration
        });
    }

    refreshSelectedProject() {
        if (!this.selectedRow) {
            return;
        }

        this.projectService.getProjectById(this.selectedRow.project.id).then(response => {
            if (typeof response === 'string') {
                this.selectedRow = null;
            } else {
                this.selectedRow.project = response;
            }
        });
    }

    groupOpened(row: ProjectRow) {
        this.openedProjectId = row.project.id;
        this.selectedRow = row;
    }

    groupClosed(row: ProjectRow) {
        if (this.openedProjectId === row.project.id) {
            this.openedProjectId = '';
            this.selectedRow = null;
        }
    }

    updateLogText() {
        this.projectService.getCurrentOutput(this.selectedRow.project.id).then(response => {
            if (typeof response === 'string') {
                this.logData.oxDNALog = 'No logs found for this project.';
            } else {
                const logResponse = response as LogResponse;

                this.logData.oxDNALog = logResponse.stdout;
                this.logData.programLog = logResponse.log;

                if (this.selectedRow.project.running !== logResponse.running) {
                    this.refreshSelectedProject();
                }
            }
        });
    }

    startSimulation(row: ProjectRow) {
        this.projectService.execute(row.project.id, false).then(_ => {
            this.projectService.getProjectById(row.project.id).then(response => {
                if (typeof response !== 'string') {
                    row.project = response;
                }
                row.starting = false;
                row.restarting = false;
            });
        }, _ => {
            // TODO (jace) display useful error message
            this.showSnackBar('You must configure this project before executing it');
            row.starting = false;
            row.restarting = false;
        });
    }

    restartClicked(row: ProjectRow) {
        row.restarting = true;
        if (row.project.running) {
            this.projectService.terminate(row.project.id).then(_ => {
                this.startSimulation(row);
            }, _ => {
                this.startSimulation(row);
            });
        } else {
            this.startSimulation(row);
        }
    }

    startClicked(row: ProjectRow) {
        row.starting = true;
        this.startSimulation(row);
    }

    viewOutputClicked(row: ProjectRow) {
        this.logOpen = true;
        this.logData.project = row.project;
        const dialogRef = this.dialog.open(LogOutputDialogComponent, {
            data: this.logData
        });

        dialogRef.afterClosed().subscribe(_ => {
            this.logOpen = false;
            this.logData.project = null;
            this.logData.oxDNALog = '';
            this.logData.programLog = '';
        });

        this.selectedRow = row;
        this.updateLogText();
    }

    stopClicked(row: ProjectRow) {
        this.projectService.terminate(row.project.id).then(_ => {
            this.showSnackBar('Project "' + row.project.name + '" was stopped');
            this.projectService.getProjectById(row.project.id).then(response => {
                if (typeof response !== 'string') {
                    row.project = response;
                }
            });
        });
    }

    downloadClicked(row: ProjectRow) {
        row.downloading = true;
        this.showSnackBar('Processing download...', 1000);
        this.projectService.downloadZipFile(row.project).then(value => {
            const url = window.URL.createObjectURL(value.data);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            a.download = value.fileName;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            row.downloading = false;
        });
    }

    editClicked(row: ProjectRow) {
        this.projectClicked(row.project);
    }
}
