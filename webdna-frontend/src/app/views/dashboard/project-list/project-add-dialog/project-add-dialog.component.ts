import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AddProjectData {
    name: string;
}

@Component({
    selector: 'project-add-dialog',
    templateUrl: './project-add-dialog.component.html',
    styleUrls: ['./project-add-dialog.component.css']
})
export class ProjectAddDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ProjectAddDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AddProjectData) { }

    onCloseClicked(): void {
        this.dialogRef.close();
    }

    detectEnter(event) {
        const charCode = event.which ? event.which : event.keyCode;
        if (charCode === 13) {
            this.dialogRef.close(this.data.name);
        }

        return true;
    }
}
