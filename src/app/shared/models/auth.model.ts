export type UserRole = 'entrenador' | 'cliente' | 'superadmin';

export interface LoginRequest {
  email: string;
  password: string;
}

// Shape returned by the backend API
export interface ApiLoginResponse {
  success: boolean;
  message: string;
  data: {
    token:  string;
    rol:    string;   // backend uses "rol" (Spanish)
    userId: number;
    nombre: string;
    email:  string;
  };
}

// Normalized internal shape used throughout the app
export interface LoginResponse {
  token:  string;
  role:   UserRole;
  nombre: string;
}

export interface JwtPayload {
  sub:   string;
  email: string;
  rol?:  UserRole;   // backend claim name
  role?: UserRole;   // fallback if backend changes to English
  exp:   number;
  iat:   number;
}
