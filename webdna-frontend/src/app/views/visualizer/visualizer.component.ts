import { Component, OnInit } from '@angular/core';
import { Project } from '../../services/project/project';
import { ProjectService } from '../../services/project/project.service';

@Component({
  selector: 'visualizer-cmp',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css']
})
export class VisualizerComponent implements OnInit {

  projects: Project[] = [];
  selectedProject: Project;

  loading = true;
  forcing = false;

  constructor(private projectService: ProjectService) {

  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().then(response => {
      if (typeof response !== 'string') {
        this.projects = response;
        if (Array.isArray(this.projects) && this.projects.length > 0) {
          this.selectedProject = this.projects[0];
        }
      }
    });
  }

  loadProject() {
    this.loading = true;

    console.log(this.selectedProject.id);

    const projectId = this.selectedProject.id;

    this.projectService.getProjectById(projectId).then(response => {
      if (response.running) {
        this.forcing = true;
        this.projectService.generateVisualization(projectId).then(_ => {
          this.forcing = false;
          this.show();
        }, _ => {
          this.show();
        });
      } else {
        this.show();
      }
    });
  }

  show() {
    this.loading = false;
  }
}
