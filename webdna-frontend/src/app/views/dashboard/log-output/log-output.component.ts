import { Component, Input, AfterViewChecked, ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'log-output',
    templateUrl: './log-output.component.html'
})
export class LogOutputComponent implements AfterViewChecked {
    @Input()
    logText: string;

    @Input()
    height: number;

    get lines(): string[] {
        return this.logText.split('\n');
    }

    constructor(private changeDetectorRef: ChangeDetectorRef) { }

    ngAfterViewChecked() {
        this.changeDetectorRef.detectChanges();
    }
}
