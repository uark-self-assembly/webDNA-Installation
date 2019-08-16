import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AddProjectData {
    name: string;
}

@Component({
    selector: 'register-success-dialog',
    templateUrl: './register-success-dialog.component.html',
})
export class RegisterSuccessDialogComponent {
    constructor(public dialogRef: MatDialogRef<RegisterSuccessDialogComponent>) { }

    onCloseClicked(): void {
        this.dialogRef.close();
    }
}
