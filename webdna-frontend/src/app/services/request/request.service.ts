import { Headers, Http, Response, RequestOptionsArgs, ResponseContentType } from '@angular/http';
import { StorageService } from '../storage/storage.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';


export class FileResponse {
  fileName: string;
  data: Blob;

  constructor(fileName: string, data: Blob) {
    this.fileName = fileName;
    this.data = data;
  }
}

@Injectable()
export class RequestService {
  isDev = true;

  get host(): string {
    return 'http://' + environment.WAN_IP;
  }

  constructor(
    private http: Http,
    private storageService: StorageService) { }

  buildUrl(urlPieces: string[]): string {
    const url = this.host + '/api/' + urlPieces.join('/');
    if (url.indexOf('?') >= 0) {
      return url;
    } else {
      return url + '/';
    }
  }

  buildHeaders(authenticated: boolean = false, isFile: boolean = false): Headers {
    const headers = new Headers();
    if (!isFile) {
      headers.append('Content-Type', 'application/json');
    }

    if (authenticated) {
      const authenticationToken = this.storageService.token;
      headers.append('Authorization', 'Bearer ' + authenticationToken);
    }

    return headers;
  }

  buildOptions(authenticated: boolean = false, isFile: boolean = false): RequestOptionsArgs {
    return { headers: this.buildHeaders(authenticated, isFile) };
  }

  doPromiseResult = <T>(response) => {
    const json = response.json();
    if (json.message !== 'success') {
      return json.message;
    } else {
      return json.response == null ? 'success' : json.response as T;
    }
  }

  getResponse(urlPieces: string[], authenticated: boolean = false): Promise<Response> {
    return this.http.get(this.buildUrl(urlPieces), this.buildOptions(authenticated)).toPromise();
  }

  get<T>(urlPieces: string[], authenticated: boolean = false): Promise<T> {
    return this.getResponse(urlPieces, authenticated).then(this.doPromiseResult);
  }

  post<T>(urlPieces: string[], body?: any, authenticated: boolean = false): Promise<T> {
    return this.http.post(this.buildUrl(urlPieces), body, this.buildOptions(authenticated))
      .toPromise()
      .then(this.doPromiseResult);
  }

  put<T>(urlPieces: string[], body?: any, authenticated: boolean = false): Promise<T> {
    return this.http.put(this.buildUrl(urlPieces), body, this.buildOptions(authenticated))
      .toPromise()
      .then(this.doPromiseResult);
  }

  getFile(urlPieces: string[], fileName: string = 'file', authenticated: boolean = false): Promise<FileResponse> {
    return this.http.get(this.buildUrl(urlPieces), {
      responseType: ResponseContentType.Blob,
      headers: this.buildHeaders(authenticated, true)
    }).map(res => {
      return new FileResponse(fileName, res.blob());
    }).toPromise();
  }

  postFile(urlPieces: string[], formData: FormData, authenticated: boolean = false): Promise<Response> {
    return this.http.post(this.buildUrl(urlPieces), formData, this.buildOptions(authenticated, true)).toPromise();
  }

  delete<T>(urlPieces: string[], authenticated: boolean = false): Promise<T> {
    return this.http.delete(this.buildUrl(urlPieces), this.buildOptions(authenticated))
      .toPromise()
      .then(this.doPromiseResult);
  }
}
