import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideChevronLeft, LucideChevronRight, LucideCircleAlert, LucideCircleCheck, LucideMail } from '@lucide/angular';
import { Observable } from 'rxjs';
import { ModerationAdminApi } from '../../../core/api/moderation-admin-api';
import { CATEGORIES, CATEGORY_LABELS, CompanyRequest, CompanyRequestStatus, REJECTION_MESSAGES } from '../../../core/models/moderation';
import { ModerationCategory } from '../../../core/models/review';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { apiErrorMessage, confirmAction } from '../api-error';
import { Notice } from '../status';

/** Enlace para responder desde el programa de correo, con el texto escrito. */
export function mailtoLink(request: CompanyRequest, body: string): string {
  const subject = request.tipo === 'revision_resena' ? 'Tu solicitud de revisión de una reseña' : 'Tu solicitud de corrección de datos';
  return `mailto:${encodeURIComponent(request.correo ?? '')}?subject=${encodeURIComponent(`Mbaapohara: ${subject}`)}&body=${encodeURIComponent(body)}`;
}

/**
 * Solicitudes de empresas (3.9b). La respuesta se manda por correo a mano (enlace «Responder por correo») y se
 * registra al marcarla como respondida: ahí se borran el nombre y el correo. Si la reseña incumple las reglas, se
 * puede retirar con la misma acción que los reportes.
 */
@Component({
  selector: 'app-requests-admin',
  imports: [DatePipe, ReactiveFormsModule, PageState, LucideCircleAlert, LucideCircleCheck, LucideMail, LucideChevronLeft, LucideChevronRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../admin.css', '../moderation-queue/moderation-queue.css'],
  host: { class: 'admin-screen' },
  template: `
    <h1 class="h1">Solicitudes de empresas</h1>
    <p class="body">
      Pedidos que llegan por el formulario público. Respondé por correo y después marcá la solicitud como respondida: se
      borran el nombre y el correo, y queda la respuesta.
    </p>

    <nav class="tabs" aria-label="Estado">
      @for (tab of tabs; track tab.label) {
        <a class="mb-chip" href="" [attr.aria-current]="estado() === tab.value ? 'page' : null" (click)="$event.preventDefault(); select(tab.value)">{{ tab.label }}</a>
      }
    </nav>

    <div role="status">
      @if (notice(); as n) {
        <p class="notice body-sm" [class.notice--ok]="n.kind === 'ok'" [class.notice--error]="n.kind === 'error'">
          @if (n.kind === 'ok') { <svg lucideCircleCheck [size]="16" aria-hidden="true"></svg> } @else { <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg> }
          {{ n.text }}
        </p>
      }
    </div>

    @if (requests.error()) {
      <app-page-state kind="error" title="No pudimos cargar las solicitudes." (retry)="requests.reload()" />
    } @else if (requests.hasValue()) {
      @if (requests.value().total === 0) {
        <app-page-state kind="empty" [title]="estado() === 'pendiente' ? 'No hay solicitudes pendientes.' : 'No hay solicitudes.'" />
      } @else {
        <ul class="rows">
          @for (item of requests.value().data; track item.id) {
            <li class="item">
              <div class="item__head">
                <div class="row__main">
                  <span class="row__title">
                    {{ item.tipo === 'revision_resena' ? 'Revisar una reseña' : 'Corregir datos' }}
                    @if (item.empresa) { · {{ item.empresa.nombre }} }
                  </span>
                  <span class="mb-meta"><span>Recibida el {{ item.fecha | date: 'short' }}</span>
                    @if (item.fechaRespuesta) { <span>Respondida el {{ item.fechaRespuesta | date: 'short' }}</span> }
                  </span>
                </div>
                <span class="mb-tag" [class.mb-tag-warning]="item.estado === 'pendiente'" [class.mb-tag-success]="item.estado === 'respondida'">
                  {{ item.estado === 'pendiente' ? 'Pendiente' : 'Respondida' }}
                </span>
              </div>

              @if (item.resena; as review) {
                @if (review.publicada) {
                  <div class="texts">
                    <div><strong class="body-sm">Lo bueno</strong><p class="body">{{ review.loBueno }}</p></div>
                    <div><strong class="body-sm">A mejorar</strong><p class="body">{{ review.aMejorar }}</p></div>
                  </div>
                } @else {
                  <p class="body-sm hint">La reseña ya no está publicada.</p>
                }
              }

              <div class="signals body-sm">
                <h2 class="signals__title">Mensaje</h2>
                <p class="message">{{ item.mensaje }}</p>
                @if (item.nombre) { <p class="message">De: {{ item.nombre }} &lt;{{ item.correo }}&gt;</p> }
                @if (item.respuesta) { <p class="message"><strong>Respuesta:</strong> {{ item.respuesta }}</p> }
              </div>

              @if (item.estado === 'pendiente') {
                @if (retiring() === item.id && item.resena) {
                  <form class="reject" (submit)="confirmRetire($event, item)" novalidate>
                    <div class="mb-field">
                      <label [for]="'cat-' + item.id">Regla que incumple la reseña</label>
                      <select [id]="'cat-' + item.id" class="mb-input" [formControl]="category">
                        @for (c of categories; track c) { <option [value]="c">{{ categoryLabels[c] }}</option> }
                      </select>
                    </div>
                    <div class="mb-field" [class.mb-field-error]="reason.invalid && reason.touched">
                      <label [for]="'motivo-' + item.id">Motivo que va a leer quien la escribió</label>
                      <textarea [id]="'motivo-' + item.id" class="mb-input" rows="3" maxlength="500" [formControl]="reason"></textarea>
                    </div>
                    <div class="row__actions">
                      <button type="submit" class="mb-btn mb-btn-primary mb-btn-sm" [disabled]="busy() === item.id">Retirar la reseña</button>
                      <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" (click)="retiring.set(null)">Cancelar</button>
                    </div>
                  </form>
                } @else if (answering() === item.id) {
                  <form class="reject" (submit)="confirmAnswer($event, item)" novalidate>
                    <div class="mb-field" [class.mb-field-error]="answer.invalid && answer.touched">
                      <label [for]="'respuesta-' + item.id">Respuesta a la empresa</label>
                      <textarea [id]="'respuesta-' + item.id" class="mb-input" rows="4" maxlength="2000" [formControl]="answer"></textarea>
                      <span class="mb-help">De 10 a 2.000 caracteres. Mandala por correo y después marcala como respondida.</span>
                    </div>
                    <div class="row__actions">
                      <a class="mb-btn mb-btn-secondary mb-btn-sm" [href]="mailto(item)"><svg lucideMail [size]="16" aria-hidden="true"></svg>Responder por correo</a>
                      <button type="submit" class="mb-btn mb-btn-primary mb-btn-sm" [disabled]="busy() === item.id">Marcar como respondida</button>
                      <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" (click)="answering.set(null)">Cancelar</button>
                    </div>
                  </form>
                } @else {
                  <div class="row__actions">
                    <button type="button" class="mb-btn mb-btn-primary mb-btn-sm" (click)="startAnswer(item)">Responder…</button>
                    @if (item.resena?.publicada) {
                      <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" (click)="startRetire(item)">Retirar la reseña…</button>
                    }
                  </div>
                }
              }
            </li>
          }
        </ul>
        @if (totalPages() > 1) {
          <nav class="pager" aria-label="Páginas de solicitudes">
            <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" [disabled]="page() <= 1" (click)="page.set(page() - 1)">
              <svg lucideChevronLeft [size]="16" aria-hidden="true"></svg>Anterior
            </button>
            <span class="body-sm">Página {{ page() }} de {{ totalPages() }}</span>
            <button type="button" class="mb-btn mb-btn-secondary mb-btn-sm" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">
              Siguiente<svg lucideChevronRight [size]="16" aria-hidden="true"></svg>
            </button>
          </nav>
        }
      }
    } @else {
      <app-page-state kind="loading" message="Cargando solicitudes…" />
    }
  `,
  styles: `.message { margin: 0; white-space: pre-line; overflow-wrap: anywhere; }`,
})
export class RequestsAdmin {
  private readonly api = inject(ModerationAdminApi);
  protected readonly tabs: { label: string; value: CompanyRequestStatus | undefined }[] = [
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Respondidas', value: 'respondida' },
    { label: 'Todas', value: undefined },
  ];
  protected readonly estado = signal<CompanyRequestStatus | undefined>('pendiente');
  protected readonly page = signal(1);
  protected readonly requests = this.api.requestsResource(this.estado, this.page);
  protected readonly busy = signal<number | null>(null);
  protected readonly notice = signal<Notice | null>(null);
  protected readonly answering = signal<number | null>(null);
  protected readonly retiring = signal<number | null>(null);

  protected readonly categories = CATEGORIES;
  protected readonly categoryLabels = CATEGORY_LABELS;
  protected readonly category = new FormControl<ModerationCategory>('TER', { nonNullable: true });
  protected readonly reason = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)] });
  protected readonly answer = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(2000)] });
  private readonly answerText = toSignal(this.answer.valueChanges, { initialValue: '' });
  protected readonly mailto = (item: CompanyRequest) => mailtoLink(item, this.answerText());

  protected readonly totalPages = computed(() => {
    if (!this.requests.hasValue()) return 1;
    const { total, pageSize } = this.requests.value();
    return Math.max(1, Math.ceil(total / pageSize));
  });

  protected select(estado: CompanyRequestStatus | undefined): void {
    this.estado.set(estado);
    this.page.set(1);
  }

  protected startAnswer(item: CompanyRequest): void {
    this.retiring.set(null);
    this.answer.reset('');
    this.answering.set(item.id);
  }

  protected confirmAnswer(event: Event, item: CompanyRequest): void {
    event.preventDefault();
    this.answer.markAsTouched();
    if (this.answer.invalid) return;
    if (!confirmAction('¿Marcar como respondida? Se borran el nombre y el correo de esta solicitud; asegurate de haber mandado el correo.')) return;
    this.run(item, this.api.answer(item.id, this.answer.value.trim()), 'Registraste la respuesta. Se borraron el nombre y el correo.');
  }

  protected startRetire(item: CompanyRequest): void {
    this.answering.set(null);
    this.category.setValue('TER');
    this.reason.reset(REJECTION_MESSAGES.TER);
    this.retiring.set(item.id);
  }

  protected confirmRetire(event: Event, item: CompanyRequest): void {
    event.preventDefault();
    this.reason.markAsTouched();
    if (this.reason.invalid || !item.resena) return;
    this.run(item, this.api.retire(item.resena.id, this.category.value, this.reason.value.trim()),
      'Retiraste la reseña. Respondé la solicitud para cerrarla.');
  }

  private run(item: CompanyRequest, action: Observable<unknown>, success: string): void {
    this.busy.set(item.id);
    this.notice.set(null);
    action.subscribe({
      next: () => {
        this.busy.set(null);
        this.answering.set(null);
        this.retiring.set(null);
        this.notice.set({ kind: 'ok', text: success });
        this.requests.reload();
      },
      error: (error: unknown) => {
        this.busy.set(null);
        this.notice.set({ kind: 'error', text: apiErrorMessage(error) });
      },
    });
  }
}
