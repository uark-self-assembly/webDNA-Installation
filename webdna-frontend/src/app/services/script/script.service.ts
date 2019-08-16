import { RequestService } from '../request/request.service';
import { Script } from './script';
import { Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ScriptService {
  private scriptsUrl = ['scripts'];

  projectsUrl(projectId) {
    return ['projects'].concat(projectId);
  }

  constructor(private requestService: RequestService, private storageService: StorageService) { }

  getScripts(): Promise<Script[]> {
    return this.requestService.get(this.scriptsUrl, true);
  }

  uploadScript(file: File, script: Script): Promise<Response> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('file_name', script.file_name);
    formData.append('description', script.description);

    return this.requestService.postFile(this.scriptsUrl, formData, true);
  }

  getScriptChain(projectId: string): Promise<string[]> {
    return this.requestService.get(this.projectsUrl(projectId).concat('script-chain'), true);
  }

  setPipeline(projectId: string, scripts: Script[]): Promise<string> {
    const body = {
      project_id: projectId,
      scripts: scripts.map(value => value.id)
    };

    return this.requestService.post(this.projectsUrl(projectId).concat('script-chain'), body, true);
  }

  getAnalysisLog(projectId: string): Promise<string> {
    return this.requestService.get(this.projectsUrl(projectId).concat('analysis-output'), true);
  }

  runAnalysis(projectId: string): Promise<string> {
    return this.requestService.get(this.projectsUrl(projectId).concat('execute-analysis'), true);
  }

  deleteScript(scriptId: string): Promise<string> {
    return this.requestService.delete(this.scriptsUrl.concat(scriptId), true);
  }
}
