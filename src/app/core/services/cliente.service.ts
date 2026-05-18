import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, ClienteCreate } from '../../shared/models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly _clientes = signal<Cliente[]>([]);
  readonly clientes = this._clientes.asReadonly();

  private readonly base = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cliente[]> {
    return this.http
      .get<Cliente[]>(this.base)
      .pipe(tap(list => this._clientes.set(list)));
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.base}/${id}`);
  }

  create(data: ClienteCreate): Observable<Cliente> {
    return this.http
      .post<Cliente>(this.base, data)
      .pipe(tap(c => this._clientes.update(list => [...list, c])));
  }

  update(id: number, data: Partial<ClienteCreate>): Observable<Cliente> {
    return this.http
      .put<Cliente>(`${this.base}/${id}`, data)
      .pipe(tap(c => this._clientes.update(list => list.map(x => (x.id === id ? c : x)))));
  }

  remove(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/${id}`)
      .pipe(tap(() => this._clientes.update(list => list.filter(x => x.id !== id))));
  }
}
