import { NgModule } from '@angular/core';
import { LogOutputComponent } from '../dashboard/log-output/log-output.component';
import { CommonModule } from '@angular/common';
import { DndModule } from 'ng2-dnd';

@NgModule({
  declarations: [
    LogOutputComponent
  ],
  imports: [
    CommonModule,
    DndModule
  ],
  exports: [
    LogOutputComponent,
    DndModule
  ]
})
export class SharedModule {}
