import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Project } from '../../../../services/project/project';

export interface LogOutputData {
    project: Project;
    logHeight: number;
    oxDNALog: string;
    programLog: string;
}

@Component({
    selector: 'log-output-dialog',
    templateUrl: './log-output-dialog.component.html'
})
export class LogOutputDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<LogOutputDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: LogOutputData) { }

    onCloseClicked(): void {
        this.dialogRef.close();
    }
}
