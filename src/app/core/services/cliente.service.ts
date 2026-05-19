import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, ClienteCreate } from '../../shared/models/cliente.model';

interface ApiEnvelope<T> {
  success: boolean;
  data:    T;
  message: string;
  errors:  string[];
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly _clientes = signal<Cliente[]>([]);
  readonly clientes = this._clientes.asReadonly();

  private readonly base = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cliente[]> {
    return this.http
      .get<ApiEnvelope<any[]>>(this.base)
      .pipe(
        map(res => (res.data ?? []).map(r => this.mapCliente(r))),
        tap(list => this._clientes.set(list))
      );
  }

  getById(id: string): Observable<Cliente> {
    return this.http
      .get<ApiEnvelope<any>>(`${this.base}/${id}`)
      .pipe(map(res => this.mapCliente(res.data)));
  }

  create(data: ClienteCreate): Observable<Cliente> {
    return this.http
      .post<ApiEnvelope<any>>(this.base, data)
      .pipe(
        map(res => this.mapCliente(res.data)),
        tap(c => this._clientes.update(list => [...list, c]))
      );
  }

  update(id: string, data: Partial<ClienteCreate>): Observable<Cliente> {
    return this.http
      .put<ApiEnvelope<any>>(`${this.base}/${id}`, data)
      .pipe(
        map(res => this.mapCliente(res.data)),
        tap(c => this._clientes.update(list => list.map(x => (x.id === id ? c : x))))
      );
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/${id}`)
      .pipe(tap(() => this._clientes.update(list => list.filter(x => x.id !== id))));
  }

  // Normaliza las diferencias de nomenclatura entre backend y modelo frontend
  private mapCliente(raw: any): Cliente {
    return {
      id:                    raw.id,
      nombre:                raw.nombre ?? '',
      apellido:              raw.apellido ?? raw.apellidos ?? '',
      email:                 raw.email ?? '',
      telefono:              raw.telefono,
      fechaNacimiento:       raw.fechaNacimiento ?? raw.fecha_nacimiento ?? '',
      genero:                raw.genero ?? raw.sexo ?? 'Masculino',
      pesoInicial:           raw.pesoInicial ?? raw.peso_inicial,
      altura:                raw.altura ?? raw.estatura,
      condicionesMedicas:    raw.condicionesMedicas ?? raw.condiciones_medicas,
      medicamentos:          raw.medicamentos,
      lesiones:              raw.lesiones,
      nivelActividad:        raw.nivelActividad ?? raw.nivel ?? 'moderado',
      objetivos:             raw.objetivos ?? raw.objetivo,
      parqAprobado:          raw.parqAprobado ?? raw.parqCompletado ?? raw.parq_aprobado ?? false,
      consentimientoFirmado: raw.consentimientoFirmado ?? raw.consentimientoAceptado ?? raw.consentimiento_firmado ?? false,
      entrenadorId:          raw.entrenadorId ?? raw.entrenador_id ?? 0,
      creadoEn:              raw.creadoEn ?? raw.createdAt ?? raw.created_at ?? '',
      activo:                raw.activo ?? true,
      fotoPerfil:            raw.fotoPerfil ?? raw.foto_perfil,
    };
  }
}
