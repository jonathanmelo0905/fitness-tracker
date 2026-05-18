export type UserRole = 'entrenador' | 'cliente' | 'superadmin';

export interface LoginRequest {
  email: string;
  password: string;
}

// Nested user object inside the backend data envelope
export interface UsuarioInfo {
  id:       number;
  tenantId: string;
  nombre:   string;
  email:    string;
  plan:     string;
}

// Exact shape returned by the backend API
export interface ApiLoginResponse {
  success: boolean;
  data: {
    accessToken:  string;
    refreshToken: string;
    tipo:         string;   // "entrenador" | "cliente" | "superadmin"
    usuario:      UsuarioInfo;
  };
}

// Normalized internal shape used throughout the app
export interface LoginResponse {
  token:   string;
  role:    UserRole;
  usuario: UsuarioInfo;
}

export interface JwtPayload {
  sub:   string;
  email: string;
  tipo?: UserRole;   // backend claim name
  role?: UserRole;   // fallback
  exp:   number;
  iat:   number;
}
