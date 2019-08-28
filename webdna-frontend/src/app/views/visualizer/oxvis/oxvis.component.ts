import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Http } from '@angular/http';
import { RequestService } from '../../../services/request/request.service';
import { ProjectService } from '../../../services/project/project.service';


@Component({
  selector: 'oxvis-cmp',
  templateUrl: './oxvis.component.html'
})
export class VisComponent implements AfterViewInit {

  @Input()
  public projectId: string;

  @ViewChild('oxvisFrame') oxvisFrame: ElementRef;

  constructor(private http: Http, private requestService: RequestService, private projectService: ProjectService) {
  }

  ngAfterViewInit() {
    this.oxvisFrame.nativeElement.srcdoc = '<html><body>Loading...</body></html>';
    this.getMainOxvisPage();
  }

  getMainOxvisPage() {

    this.projectService.getConfiguration(this.projectId).then(config => {
      config.dat = config.dat.replace(/\n/g, '\\n');
      config.top = config.top.replace(/\n/g, '\\n');
      this.http.get(this.requestService.host + '/assets/oxvis/index.html').map(res => res.text())
      .subscribe(response => {
        var resp = response.replace('%%CONFIG_DAT%%', config.dat).replace('%%CONFIG_TOP%%', config.top);
	console.log(resp);
        console.log(config.dat);
        this.oxvisFrame.nativeElement.srcdoc = resp;
      });
    });
  }
}
