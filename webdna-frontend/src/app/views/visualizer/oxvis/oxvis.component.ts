import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Http } from '@angular/http';
import { RequestService } from '../../../services/request/request.service';

@Component({
  selector: 'oxvis-cmp',
  templateUrl: './oxvis.component.html'
})
export class VisComponent implements AfterViewInit {

  @Input()
  public projectId: string;

  @ViewChild('oxvisFrame') oxvisFrame: ElementRef;

  constructor(private http: Http, private requestService: RequestService) {
  }

  ngAfterViewInit() {
    this.oxvisFrame.nativeElement.srcdoc = '<html><body>Loading...</body></html>';
    this.getMainOxvisPage();
  }

  getMainOxvisPage() {
    this.http.get(this.requestService.host + '/static/index.html').map(res => res.text())
      .subscribe(response => {
        this.oxvisFrame.nativeElement.srcdoc = response.replace('%%PROJECTID%%', this.projectId);
      });
  }
}
