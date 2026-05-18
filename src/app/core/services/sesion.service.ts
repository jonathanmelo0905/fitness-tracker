import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sesion, SesionCreate } from '../../shared/models/sesion.model';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly _sesiones = signal<Sesion[]>([]);
  readonly sesiones = this._sesiones.asReadonly();

  private readonly base = `${environment.apiUrl}/sesiones`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Sesion[]> {
    return this.http
      .get<Sesion[]>(this.base)
      .pipe(tap(list => this._sesiones.set(list)));
  }

  getByCliente(clienteId: number): Observable<Sesion[]> {
    return this.http.get<Sesion[]>(`${this.base}/cliente/${clienteId}`);
  }

  getProxima(): Observable<Sesion | null> {
    return this.http.get<Sesion | null>(`${this.base}/proxima`);
  }

  create(data: SesionCreate): Observable<Sesion> {
    return this.http
      .post<Sesion>(this.base, data)
      .pipe(tap(s => this._sesiones.update(list => [...list, s])));
  }

  update(id: number, data: Partial<SesionCreate>): Observable<Sesion> {
    return this.http
      .put<Sesion>(`${this.base}/${id}`, data)
      .pipe(tap(s => this._sesiones.update(list => list.map(x => (x.id === id ? s : x)))));
  }

  remove(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/${id}`)
      .pipe(tap(() => this._sesiones.update(list => list.filter(x => x.id !== id))));
  }
}
