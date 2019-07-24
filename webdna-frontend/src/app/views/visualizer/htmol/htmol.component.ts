import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Http } from '@angular/http';
import { RequestService } from '../../../services/request/request.service';

@Component({
  selector: 'htmol-cmp',
  templateUrl: './htmol.component.html'
})
export class HtmolComponent implements AfterViewInit {

  @Input()
  public projectId: string;

  @ViewChild('htmolFrame') htmolFrame: ElementRef;

  constructor(private http: Http, private requestService: RequestService) {
  }

  ngAfterViewInit() {
    this.htmolFrame.nativeElement.srcdoc = '<html><body>Loading...</body></html>';
    this.getMainHtmolPage();
  }

  getMainHtmolPage() {
    this.http.get(this.requestService.host + '/static/HTMoL.html').map(res => res.text())
      .subscribe(response => {
        this.htmolFrame.nativeElement.srcdoc = response.replace('%%PROJECTID%%', this.projectId);
      });
  }
}
