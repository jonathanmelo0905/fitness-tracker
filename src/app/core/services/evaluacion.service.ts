import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Evaluacion, EvaluacionCreate } from '../../shared/models/evaluacion.model';

@Injectable({ providedIn: 'root' })
export class EvaluacionService {
  private readonly base = `${environment.apiUrl}/evaluaciones`;

  constructor(private http: HttpClient) {}

  getByCliente(clienteId: number): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(`${this.base}/cliente/${clienteId}`);
  }

  getById(id: number): Observable<Evaluacion> {
    return this.http.get<Evaluacion>(`${this.base}/${id}`);
  }

  create(data: EvaluacionCreate): Observable<Evaluacion> {
    return this.http.post<Evaluacion>(this.base, data);
  }

  update(id: number, data: Partial<EvaluacionCreate>): Observable<Evaluacion> {
    return this.http.put<Evaluacion>(`${this.base}/${id}`, data);
  }
}
