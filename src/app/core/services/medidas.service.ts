import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medida, MedidaCreate } from '../../shared/models/evaluacion.model';

@Injectable({ providedIn: 'root' })
export class MedidasService {
  private readonly base = `${environment.apiUrl}/medidas`;

  constructor(private http: HttpClient) {}

  getByCliente(clienteId: number): Observable<Medida[]> {
    return this.http.get<Medida[]>(`${this.base}/cliente/${clienteId}`);
  }

  create(data: MedidaCreate): Observable<Medida> {
    return this.http.post<Medida>(this.base, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
