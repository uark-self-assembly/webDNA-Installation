import { Component, Input, OnInit } from '@angular/core';
import { SimulationOption } from '../project-config.component';
import { ProjectService } from '../../../../services/project/project.service';
import { Project } from '../../../../services/project/project';
import { MatDialog } from '@angular/material/dialog';
import { FileDialogComponent, FileDialogData } from '../../file-dialog/file-dialog.component';

@Component({
    selector: 'simulation-file-upload',
    templateUrl: './simulation-file-upload.component.html'
})
export class SimulationFileUploadComponent implements OnInit {
    @Input()
    option: SimulationOption;

    @Input()
    project: Project;

    existingFile = false;

    get fileDialogData(): FileDialogData {
        return {
            project: this.project,
            projectFileType: this.option.propertyName
        }
    }

    constructor(
        private projectService: ProjectService,
        public dialog: MatDialog) { }

    ngOnInit() {
        this.projectService.checkFileExists(this.project.id, this.option.propertyName).then(response => {
            this.existingFile = response;
        }, _ => {
            this.existingFile = false;
        });
    }

    fileChange(event) {
        const fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.option.value = fileList[0];
        }
    }

    clearFileClicked() {
        this.option.value = null;
    }

    fileButtonClicked() {
        document.getElementById(this.option.propertyName).click();
    }

    viewExistingClicked() {
        this.dialog.open(FileDialogComponent, {
            data: this.fileDialogData
        });
    }
}
