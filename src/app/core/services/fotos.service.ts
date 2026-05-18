import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FotoEvolucion } from '../../shared/models/evaluacion.model';

@Injectable({ providedIn: 'root' })
export class FotosService {
  private readonly base = `${environment.apiUrl}/fotos`;

  constructor(private http: HttpClient) {}

  getByCliente(clienteId: number): Observable<FotoEvolucion[]> {
    return this.http.get<FotoEvolucion[]>(`${this.base}/cliente/${clienteId}`);
  }

  upload(clienteId: number, file: File, notas?: string): Observable<FotoEvolucion> {
    const form = new FormData();
    form.append('file', file);
    form.append('clienteId', String(clienteId));
    if (notas) form.append('notas', notas);
    return this.http.post<FotoEvolucion>(this.base, form);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
