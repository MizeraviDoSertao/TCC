import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ModelTraining } from './model.model';

const API_ROOT = '/process_fraud_automotive/models';

@Injectable({ providedIn: 'root' })
export class ModelService {
  private readonly http = inject(HttpClient);

  list(): Observable<readonly ModelTraining[]> {
    return this.http.get<readonly ModelTraining[]>(API_ROOT);
  }

  train(file: File, adminUser: string, adminPassword: string): Observable<ModelTraining> {
    const body = new FormData();
    body.append('file', file, file.name);
    return this.http.post<ModelTraining>(`${API_ROOT}/train`, body, {
      headers: this.adminHeaders(adminUser, adminPassword)
    });
  }

  activate(trainingId: string, adminUser: string, adminPassword: string): Observable<ModelTraining> {
    return this.http.post<ModelTraining>(
      `${API_ROOT}/${encodeURIComponent(trainingId)}/activate`,
      null,
      { headers: this.adminHeaders(adminUser, adminPassword) }
    );
  }

  private adminHeaders(adminUser: string, adminPassword: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Basic ${btoa(`${adminUser}:${adminPassword}`)}`
    });
  }
}
