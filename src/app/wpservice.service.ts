import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WPServiceService {
  protected baseUrl: string = environment.apiUrl;
  constructor(public http: HttpClient) { 

  }

  public getData(subUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request: string = this.baseUrl + subUrl;
      // console.log('data', request);
      this.http
        .get(request,{})
        .subscribe(
          data => resolve(data),
          error => reject(error)
        );
    });
  }

  public postData(subUrl: string, data: any): Promise<any> {
    console.log('subUrl: ', subUrl);
    return new Promise((resolve, reject) => {
      // console.log('Token :', token);
      // console.log('Data :', JSON.stringify(data));

      const request: string = this.baseUrl + subUrl;
      this.http.post(request, data, {})
        .subscribe(
          res => resolve(res),
          error => {
            console.log('Main Error :', error);
            reject(error);
          }
        );
    });
  }

}
