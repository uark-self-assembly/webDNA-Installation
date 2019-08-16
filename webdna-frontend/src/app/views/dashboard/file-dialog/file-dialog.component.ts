import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from '../../../services/project/project';
import { ProjectService } from '../../../services/project/project.service';
import { FileResponse } from '../../../services/request/request.service';
import { Response } from '@angular/http';

export interface FileDialogData {
    project: Project;
    projectFileType: string;
}

@Component({
    selector: 'file-dialog',
    templateUrl: './file-dialog.component.html'
})
export class FileDialogComponent implements OnInit {

    fileText: string;
    fileLines: string[] = [];

    constructor(
        private projectService: ProjectService,
        public dialogRef: MatDialogRef<FileDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: FileDialogData) { }

    ngOnInit() {
        this.projectService.downloadFile(this.data.project.id, this.data.projectFileType).then((response: Response) => {
            try {
                this.fileText = response.text();
                this.fileLines = this.fileText.split('\n');
            } catch {
                this.onCloseClicked();
            }
        }, _ => {
            this.onCloseClicked();
        });
    }

    onCloseClicked(): void {
        this.dialogRef.close();
    }

    onDownloadClicked(): void {
        const a = document.createElement('a');
        a.setAttribute('style', 'display: none');
        a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.fileText));
        a.setAttribute('download', this.data.projectFileType.toLowerCase() + '.txt');

        document.body.appendChild(a);

        a.click();
        a.remove();
    }
}
