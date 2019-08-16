import { Injectable } from '@angular/core';
import { Project, ProjectFileType, LogResponse } from './project';
import { RequestService, FileResponse } from '../request/request.service';
import { StorageService } from '../storage/storage.service';
import { Response } from '@angular/http';

@Injectable()
export class ProjectService {
  private projectsUrl = ['projects'];
  private settingsUrl(projectId: string) {
    return this.projectsUrl.concat(projectId, 'settings');
  }
  private simulationUrl(projectId: string) {
    return this.projectsUrl.concat(projectId, 'simulation');
  }
  private filesUrl(projectId: string) {
    return this.projectsUrl.concat(projectId, 'files');
  }

  projectMapper(value: Project) {
    return new Project(value);
  }

  projectArrayMapper(value: Project[]) {
    if (value) {
      return value.map(val => new Project(val));
    } else {
      return [];
    }
  }

  constructor(private requestService: RequestService, private storageService: StorageService) { }

  getProjects(): Promise<Project[]> {
    return this.requestService.get(this.projectsUrl, true).then(this.projectArrayMapper);
  }

  getProjectById(projectId: string): Promise<Project> {
    return this.requestService.get(this.projectsUrl.concat(projectId), true).then(this.projectMapper);
  }

  createProject(project: Project): Promise<Project> {
    project.user = this.storageService.user.id;
    return this.requestService.post(this.projectsUrl, project, true).then(this.projectMapper);
  }

  updateProject(project: Project): Promise<Project> {
    return this.requestService.put(this.projectsUrl.concat(project.id), project, true).then(this.projectMapper);
  }

  deleteProject(project: Project): Promise<Project> {
    return this.requestService.delete(this.projectsUrl.concat(project.id), true).then(this.projectMapper);
  }

  getCurrentOutput(projectId: string): Promise<LogResponse> {
    return this.requestService.get(this.projectsUrl.concat(projectId, 'current-output'), true);
  }

  getSettings(projectId: string): Promise<object> {
    return this.requestService.get(this.settingsUrl(projectId), true);
  }

  putSettings(projectId: string, settings: any): Promise<string> {
    return this.requestService.put(this.settingsUrl(projectId), settings, true);
  }

  generateVisualization(projectId: string): Promise<string> {
    return this.requestService.get(this.projectsUrl.concat(projectId, 'generate-visualization'), true);
  }

  execute(projectId: string, regenerate: boolean = false): Promise<string> {
    const url = this.simulationUrl(projectId).concat('execute', '?regenerate=' + regenerate);
    return this.requestService.get(url, true);
  }

  terminate(projectId: string): Promise<string> {
    return this.requestService.get(this.simulationUrl(projectId).concat('terminate'), true);
  }

  uploadFile(projectId: string, file: File, projectFileType: string): Promise<Response> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('type', projectFileType.toString());

    return this.requestService.postFile(this.filesUrl(projectId).concat('upload'), formData, true);
  }

  downloadFile(projectId: string, projectFileType: string): Promise<Response> {
    return this.requestService.getResponse(this.filesUrl(projectId).concat(projectFileType, 'download'), true);
  }

  checkFileExists(projectId: string, projectFileType: string): Promise<boolean> {
    return this.requestService.get(this.filesUrl(projectId).concat(projectFileType, 'check'), true).then(response => {
      return !!response;
    });
  }

  downloadZipFile(project: Project): Promise<FileResponse> {
    return this.requestService.getFile(this.filesUrl(project.id).concat('zip'), project.name + '.zip', true);
  }

  duplicateProject(projectId: string): Promise<Project> {
    return this.requestService.get(this.projectsUrl.concat(projectId, 'duplicate'), true).then(this.projectMapper);
  }
}
