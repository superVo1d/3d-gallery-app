import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnimationType } from '../three-viewer/three-viewer.component';

export interface Model {
  name: string;
  author: string;
  animation: AnimationType;
  modelUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3001/api'; // Change to your server URL

  constructor(private http: HttpClient) {}

  // Upload a model (GLB/GLTF file with metadata)
  uploadModel(
    name: string,
    author: string,
    animation: string,
    file: File
  ): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('name', name);
    formData.append('author', author);
    formData.append('animation', animation);
    formData.append('model', file);

    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: new HttpHeaders({
        // Add any additional headers if needed
      }),
    });
  }

  // Get the list of uploaded models
  getModels(): Observable<Model[]> {
    return this.http.get<Model[]>(`${this.apiUrl}/items`);
  }
}
