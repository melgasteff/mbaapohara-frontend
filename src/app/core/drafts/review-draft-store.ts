import { inject, Injectable, signal } from '@angular/core';
import { WorkSituation } from '../models/review';
import { SessionService } from '../auth/session.service';

const KEY_PREFIX = 'mbaapohara.borrador.';
const VERSION = 1;

/**
 * Reseña sin terminar. La aceptación de las reglas no se guarda: se pide en cada envío. Los nombres de empresa y local
 * no alcanzan para retomarla: al volver se confirman con la API.
 */
export interface SavedDraft {
  /** Paso en el que quedó, de 1 a 4. */
  paso: number;
  empresa: { id: number; nombre: string };
  idLocal: number | null;
  /** Cargo como texto: al volver se busca en la lista. */
  cargo: string;
  situacion: WorkSituation | null;
  ultimoAnio: number | null;
  tipoContrato: number | null;
  modalidad: number | null;
  respuestas: Record<string, string>;
  calificacion: number | null;
  loBueno: string;
  aMejorar: string;
}

/**
 * Borrador del asistente: uno por persona, en localStorage de este dispositivo. No va al servidor, porque es una reseña
 * que la persona todavía no quiso enviar. La clave lleva el id de la cuenta, nunca el correo.
 */
@Injectable({ providedIn: 'root' })
export class ReviewDraftStore {
  private readonly session = inject(SessionService);
  private readonly writable = signal(canWrite());
  /** El navegador deja guardar (no, por ejemplo, con el almacenamiento bloqueado o lleno). */
  readonly available = this.writable.asReadonly();

  load(): SavedDraft | null {
    const key = this.key();
    if (!key) return null;
    try {
      const raw = JSON.parse(localStorage.getItem(key) ?? 'null') as { version?: unknown; borrador?: unknown } | null;
      return raw?.version === VERSION && isDraft(raw.borrador) ? raw.borrador : null;
    } catch {
      return null;
    }
  }

  save(borrador: SavedDraft): void {
    const key = this.key();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({ version: VERSION, borrador }));
      this.writable.set(true);
    } catch {
      this.writable.set(false);
    }
  }

  /** Borra el borrador de la persona con sesión, o el de la cuenta indicada (al eliminarla ya no hay sesión). */
  clear(accountId?: number): void {
    const key = accountId === undefined ? this.key() : KEY_PREFIX + accountId;
    if (!key) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Sin almacenamiento no hay nada que borrar.
    }
  }

  private key(): string | null {
    const account = this.session.account();
    return account ? KEY_PREFIX + account.id : null;
  }
}

function canWrite(): boolean {
  try {
    const probe = `${KEY_PREFIX}prueba`;
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/** El contenido de localStorage se puede alterar: lo que no tiene la forma esperada se descarta. */
function isDraft(value: unknown): value is SavedDraft {
  if (typeof value !== 'object' || value === null) return false;
  const draft = value as Record<string, unknown>;
  const empresa = draft['empresa'] as Record<string, unknown> | null | undefined;
  const numberOrNull = (name: string) => draft[name] === null || typeof draft[name] === 'number';
  const respuestas = draft['respuestas'];
  return (
    typeof empresa === 'object' && empresa !== null && typeof empresa['id'] === 'number' && typeof empresa['nombre'] === 'string' &&
    typeof draft['paso'] === 'number' &&
    ['idLocal', 'ultimoAnio', 'tipoContrato', 'modalidad', 'calificacion'].every(numberOrNull) &&
    ['cargo', 'loBueno', 'aMejorar'].every((name) => typeof draft[name] === 'string') &&
    [null, 'ACTUAL', 'ANTERIOR'].includes(draft['situacion'] as string | null) &&
    typeof respuestas === 'object' && respuestas !== null && Object.values(respuestas).every((answer) => typeof answer === 'string')
  );
}
