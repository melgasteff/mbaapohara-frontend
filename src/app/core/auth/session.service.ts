import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Account } from '../models/account';

const STORAGE_KEY = 'mbaapohara.sesion';

interface StoredSession {
  token: string;
  account: Account;
}

/**
 * Sesión de la persona: token y cuenta, en signals. Se guarda en sessionStorage (sobrevive a recargar la página y
 * se borra al cerrar la pestaña) y se cierra sola cuando vence el token. No verifica la firma: eso lo hace la API.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly state = signal<StoredSession | null>(null);
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;

  readonly token = computed(() => this.state()?.token ?? null);
  readonly account = computed(() => this.state()?.account ?? null);
  readonly isAuthenticated = computed(() => this.state() !== null);
  readonly isAdmin = computed(() => this.state()?.account.rol === 'administrador');

  constructor() {
    this.restore();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.expiryTimer));
  }

  start(token: string, account: Account): void {
    const expiresAt = tokenExpiry(token);
    if (expiresAt !== null && expiresAt <= Date.now()) return;
    this.state.set({ token, account });
    this.write({ token, account });
    this.scheduleExpiry(expiresAt);
  }

  end(): void {
    clearTimeout(this.expiryTimer);
    this.state.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Sin acceso al almacenamiento (modo privado estricto): la sesión vivía solo en memoria.
    }
  }

  private restore(): void {
    let stored: StoredSession | null = null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      stored = raw ? (JSON.parse(raw) as StoredSession) : null;
    } catch {
      stored = null;
    }
    if (stored?.token && stored.account) {
      this.start(stored.token, stored.account);
    }
    if (!this.state()) this.end();
  }

  private write(session: StoredSession): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Sin almacenamiento: la sesión dura hasta recargar la página.
    }
  }

  private scheduleExpiry(expiresAt: number | null): void {
    clearTimeout(this.expiryTimer);
    if (expiresAt === null) return;
    // setTimeout admite hasta unos 24 días; los tokens duran horas.
    this.expiryTimer = setTimeout(() => this.end(), Math.min(expiresAt - Date.now(), 2 ** 31 - 1));
  }
}

/** Momento de vencimiento (ms) según el campo `exp` del token, o `null` si no se puede leer. */
export function tokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}
