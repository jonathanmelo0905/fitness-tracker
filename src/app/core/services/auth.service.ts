import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiLoginResponse, LoginRequest, LoginResponse, JwtPayload, UserRole } from '../../shared/models/auth.model';

const TOKEN_KEY = 'nutrieval-token';
const USER_KEY = 'nutrieval-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<LoginResponse | null>(this.loadUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly userRole = computed(() => this._currentUser()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<ApiLoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        map(res => ({
          token:  res.data.token,
          role:   res.data.rol as UserRole,
          nombre: res.data.nombre,
        } satisfies LoginResponse)),
        tap(normalized => {
          localStorage.setItem(TOKEN_KEY, normalized.token);
          localStorage.setItem(USER_KEY, JSON.stringify(normalized));
          this._currentUser.set(normalized);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  hasRole(role: UserRole): boolean {
    return this._currentUser()?.role === role;
  }

  private loadUser(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (!raw || !token) return null;
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      if (payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }
      return JSON.parse(raw) as LoginResponse;
    } catch {
      return null;
    }
  }
}
