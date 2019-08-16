import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RegisterRoutes } from './register.routing';

import { RegisterComponent } from './register.component';
import { SharedModule } from '../shared/shared.module';
import { AppMaterialModule } from '../../material/app-material.module';
import { RegisterSuccessDialogComponent } from './register-success-dialog/register-success-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(RegisterRoutes),
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        AppMaterialModule
    ],
    declarations: [
        RegisterComponent,
        RegisterSuccessDialogComponent,
    ],
    entryComponents: [
        RegisterSuccessDialogComponent,
    ]
})
export class RegisterModule {}
