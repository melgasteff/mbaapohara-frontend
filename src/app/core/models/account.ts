// Modelos de la autenticación (src/auth/presentation/dto del backend).

export type UserRole = 'usuario' | 'administrador';
export type AccountStatus = 'activo' | 'bloqueado';

/** Cuenta de la persona que inició sesión (GET /users/me). */
export interface Account {
  id: number;
  email: string;
  rol: UserRole;
  estado: AccountStatus;
  fechaConsentimiento: string | null;
  fechaCreacion: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterRequest extends Credentials {
  /** Aceptación de los términos y la política de privacidad: siempre `true`. */
  aceptaTerminos: true;
}

/** Respuesta de POST /auth/login. */
export interface TokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}
