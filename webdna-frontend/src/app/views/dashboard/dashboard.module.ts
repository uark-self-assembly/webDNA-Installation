import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { DashboardRoutes } from './dashboard.routing';

import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectTableComponent } from './project-list/project-table/project-table.component';
import { DashboardComponent } from './dashboard.component';
import { VisualizerComponent } from '../visualizer/visualizer.component';
import { ProjectConfigComponent } from './project-config/project-config.component';
import { ProjectAnalysisComponent } from './project-analysis/project-analysis.component';
import { VisComponent } from '../visualizer/oxVis/oxvis.component';
import { AppMaterialModule } from '../../material/app-material.module';
import { LogOutputDialogComponent } from './log-output/dialog/log-output-dialog.component';
import { ProjectAddDialogComponent } from './project-list/project-add-dialog/project-add-dialog.component';
import { SimulationFileUploadComponent } from './project-config/simulation-file-upload/simulation-file-upload.component';
import { FileDialogComponent } from './file-dialog/file-dialog.component';
import { ScriptUploadDialogComponent } from './project-analysis/script-upload-dialog/script-upload-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardRoutes),
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        AppMaterialModule
    ],
    declarations: [
        DashboardComponent,
        VisualizerComponent,
        VisComponent,
        LogOutputDialogComponent,
        SimulationFileUploadComponent,
        ProjectAddDialogComponent,
        FileDialogComponent,
        ScriptUploadDialogComponent,
        ProjectListComponent,
        ProjectTableComponent,
        ProjectConfigComponent,
        ProjectAnalysisComponent
    ], entryComponents: [
        LogOutputDialogComponent,
        ProjectAddDialogComponent,
        FileDialogComponent,
        ScriptUploadDialogComponent,
    ]
})

export class DashboardModule { }
