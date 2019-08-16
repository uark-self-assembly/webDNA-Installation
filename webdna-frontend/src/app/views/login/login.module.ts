import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginRoutes } from './login.routing';

import { LoginComponent } from './login.component';
import { AuthenticationService } from '../../services/auth-guard/auth.service';
import { AppMaterialModule } from '../../material/app-material.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(LoginRoutes),
        FormsModule,
        ReactiveFormsModule,
        AppMaterialModule
    ],
    declarations: [
        LoginComponent,
    ],
    providers: [
        AuthenticationService,
    ]
})

export class LoginModule {}
