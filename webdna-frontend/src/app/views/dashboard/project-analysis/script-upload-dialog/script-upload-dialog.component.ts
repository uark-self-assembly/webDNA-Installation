import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ScriptService } from '../../../../services/script/script.service';
import { Script } from '../../../../services/script/script';

@Component({
    selector: 'script-upload-dialog',
    templateUrl: './script-upload-dialog.component.html'
})
export class ScriptUploadDialogComponent {
    scriptFile: File = null;
    newScriptName;
    newScriptDescription;

    get scriptFileChosen(): boolean {
        return !!this.scriptFile;
    }

    get uploadReady(): boolean {
        return this.scriptFileChosen;
    }

    constructor(
        public dialogRef: MatDialogRef<ScriptUploadDialogComponent>,
        private scriptService: ScriptService) { }

    onCloseClicked(): void {
        this.dialogRef.close(false);
    }

    fileChange(event) {
        const fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.scriptFile = fileList[0];
            this.newScriptName = this.scriptFile.name;
        }
    }

    uploadClicked() {
        const script = new Script(this.newScriptName, this.newScriptDescription);
        this.scriptService.uploadScript(this.scriptFile, script).then(_ => {
            this.dialogRef.close(true);
        }, _ => {
            this.dialogRef.close(false);
        });
    }
}
