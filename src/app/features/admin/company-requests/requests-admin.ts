import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCircleAlert, LucideMail, LucideMinus, LucidePlus } from '@lucide/angular';
import { ModerationAdminApi } from '../../../core/api/moderation-admin-api';
import { CompanyRequest, CompanyRequestStatus } from '../../../core/models/moderation';
import { keepWhileLoading } from '../../../shared/keep-while-loading';
import { InlineConfirm } from '../../../shared/ui/inline-confirm/inline-confirm';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { Pager } from '../../../shared/ui/pager/pager';
import { TabItem, Tabs } from '../../../shared/ui/tabs/tabs';
import { AdminActions } from '../admin-actions';
import { AdminNotice } from '../admin-notice/admin-notice';
import { RejectForm, Rejection } from '../reject-form/reject-form';

type RequestTab = CompanyRequestStatus | 'todas';

/** Enlace para responder desde el programa de correo, con el texto escrito. */
export function mailtoLink(request: CompanyRequest, body: string): string {
  const subject = request.tipo === 'revision_resena' ? 'Tu solicitud de revisión de una reseña' : 'Tu solicitud de corrección de datos';
  return `mailto:${encodeURIComponent(request.correo ?? '')}?subject=${encodeURIComponent(`Mbaapohara: ${subject}`)}&body=${encodeURIComponent(body)}`;
}

/**
 * Solicitudes de empresas (3.9b). La respuesta se escribe una vez: sirve para el correo (enlace «Responder por correo») y
 * para el registro. Al registrarla se borran el nombre y el correo. Si la reseña incumple las reglas, se puede retirar con la
 * misma acción que los reportes.
 */
@Component({
  selector: 'app-requests-admin',
  imports: [
    DatePipe, ReactiveFormsModule, PageState, Pager, InlineConfirm, Tabs, AdminNotice, RejectForm, LucideCircleAlert, LucideMail, LucidePlus, LucideMinus,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminActions],
  styleUrl: '../admin.css',
  host: { class: 'admin-screen' },
  template: `
    <h1 class="title" tabindex="-1">Solicitudes de empresas</h1>
    <p class="lead">
      Pedidos del formulario público. Respondé por correo y después registrá la respuesta: se borran el nombre y el correo, y queda la respuesta.
    </p>
    <app-admin-notice [notice]="actions.notice()" />
    <app-tabs label="Estado" panelId="solicitudes" [tabs]="tabs" [value]="tab()" (valueChange)="select($event)" />

    <div id="solicitudes" role="tabpanel" [attr.aria-labelledby]="'solicitudes-' + tab()">
      @if (requests.error()) {
        <app-page-state kind="error" title="No pudimos cargar las solicitudes." (retry)="requests.reload()" />
      } @else if (data(); as result) {
        @if (result.total === 0) {
          <app-page-state kind="empty" [title]="tab() === 'pendiente' ? 'No hay solicitudes pendientes' : 'No hay solicitudes'" />
        } @else {
          <ul class="rows">
            @for (item of result.data; track item.id) {
              <li>
                <div class="row">
                  <div class="row__main">
                    <h2 class="row__title">
                      {{ item.tipo === 'revision_resena' ? 'Revisar una reseña' : 'Corregir datos' }}@if (item.empresa) { · {{ item.empresa.nombre }} }
                    </h2>
                    <p class="message">{{ item.mensaje }}</p>
                    <p class="small">
                      @if (item.nombre) { {{ item.nombre }} · {{ item.correo }} · }
                      recibida el {{ item.fecha | date: 'shortDate' }}@if (item.fechaRespuesta) {, respondida el {{ item.fechaRespuesta | date: 'shortDate' }}}
                    </p>
                    @if (item.respuesta) { <p class="message"><strong>Respuesta:</strong> {{ item.respuesta }}</p> }
                  </div>
                  <span class="mb-tag" [class.mb-tag-warning]="item.estado === 'pendiente'" [class.mb-tag-success]="item.estado === 'respondida'">
                    {{ item.estado === 'pendiente' ? 'Sin responder' : 'Respondida' }}
                  </span>
                  @if (item.estado === 'pendiente') {
                    <div class="row__actions">
                      <button type="button" class="mb-btn mb-btn-primary" [attr.data-accion]="'abrir-' + item.id" [attr.aria-expanded]="answering() === item.id" (click)="startAnswer(item)">
                        Responder…<span class="visually-hidden"> la solicitud de {{ item.empresa?.nombre ?? 'la empresa' }}</span>
                      </button>
                      @if (item.resena?.publicada) {
                        <button type="button" class="mb-btn mb-btn-borrar" [attr.data-accion]="'retirar-' + item.id" [attr.aria-expanded]="retiring() === item.id" (click)="startRetire(item)">Retirar la reseña…</button>
                      }
                    </div>
                  }
                </div>

                @if (item.resena; as review) {
                  @if (review.publicada) {
                    <div class="texts">
                      <div><strong class="mb-pro"><svg lucidePlus [size]="18" aria-hidden="true"></svg>Lo bueno</strong><p>{{ review.loBueno }}</p></div>
                      <div><strong class="mb-con"><svg lucideMinus [size]="18" aria-hidden="true"></svg>A mejorar</strong><p>{{ review.aMejorar }}</p></div>
                    </div>
                  } @else {
                    <p class="small">La reseña ya no está publicada.</p>
                  }
                }

                @if (retiring() === item.id && item.resena) {
                  <app-reject-form
                    initial="TER"
                    categoryLabel="Regla que incumple la reseña"
                    submitLabel="Retirar la reseña"
                    [busy]="actions.busy() !== null"
                    (confirmed)="retire(item, $event)"
                    (cancelled)="cancelRetire(item)"
                  />
                } @else if (answering() === item.id) {
                  <form class="answer mb-entra" (submit)="askAnswer($event, item)" novalidate>
                    <div class="mb-field" [class.mb-field-error]="failed()">
                      <label [for]="'respuesta-' + item.id">Respuesta a la empresa</label>
                      <textarea [id]="'respuesta-' + item.id" class="mb-input" rows="4" maxlength="2000" [formControl]="answer" [attr.aria-invalid]="failed() ? true : null" [attr.aria-describedby]="'ayuda-' + item.id"></textarea>
                      <span class="mb-help" [id]="'ayuda-' + item.id">
                        @if (failed()) { <svg lucideCircleAlert [size]="16" aria-hidden="true"></svg> }
                        De 10 a 2.000 caracteres. Mandala por correo y después registrala.
                      </span>
                    </div>
                    <div class="row__actions">
                      <a class="mb-btn mb-btn-secondary" [href]="mailto(item)"><svg lucideMail [size]="18" aria-hidden="true"></svg>Responder por correo</a>
                      <button type="submit" class="mb-btn mb-btn-primary" [attr.data-accion]="'registrar-' + item.id">{{ actions.busy() ? 'Registrando…' : 'Registrar respuesta' }}</button>
                      <button type="button" class="mb-btn mb-btn-texto" (click)="cancelAnswer(item)">Cancelar</button>
                    </div>
                    @if (actions.confirming() === 'registrar-' + item.id) {
                      <app-inline-confirm
                        tone="neutro"
                        confirmLabel="Sí, registrar"
                        message="¿Ya mandaste el correo? Al registrar se borran el nombre y el correo de esta solicitud."
                        (confirmed)="register(item)"
                        (cancelled)="actions.cancel()"
                      />
                    }
                  </form>
                }
              </li>
            }
          </ul>
          <app-pager label="Páginas de solicitudes" [page]="page()" [pageSize]="result.pageSize" [total]="result.total" (pageChange)="page.set($event)" />
        }
      } @else {
        <app-page-state kind="loading" message="Cargando solicitudes…" />
      }
    </div>
  `,
  styles: `
    .message { font-size: 15px; line-height: 22px; white-space: pre-line; }
    .answer { display: flex; flex-direction: column; gap: var(--space-3); padding: 18px; border-radius: var(--radio-md); background: var(--blanco); }
    .answer .mb-field { width: 100%; }
  `,
})
export class RequestsAdmin {
  private readonly api = inject(ModerationAdminApi);
  protected readonly actions = inject(AdminActions);

  protected readonly tabs: TabItem<RequestTab>[] = [
    { valor: 'pendiente', etiqueta: 'Pendientes' },
    { valor: 'respondida', etiqueta: 'Respondidas' },
    { valor: 'todas', etiqueta: 'Todas' },
  ];
  protected readonly tab = signal<RequestTab>('pendiente');
  private readonly estado = signal<CompanyRequestStatus | undefined>('pendiente');
  protected readonly page = signal(1);
  protected readonly requests = this.api.requestsResource(this.estado, this.page);
  protected readonly data = keepWhileLoading(this.requests);
  protected readonly answering = signal<number | null>(null);
  protected readonly retiring = signal<number | null>(null);
  protected readonly failed = signal(false);

  protected readonly answer = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(2000), (control) => ((control.value as string).trim().length >= 10 ? null : { corto: true })],
  });
  private readonly answerText = toSignal(this.answer.valueChanges, { initialValue: '' });
  protected readonly mailto = (item: CompanyRequest) => mailtoLink(item, this.answerText());

  protected select(tab: RequestTab): void {
    this.tab.set(tab);
    this.estado.set(tab === 'todas' ? undefined : tab);
    this.page.set(1);
    this.close();
  }

  protected startAnswer(item: CompanyRequest): void {
    if (this.actions.busy() !== null) return;
    this.close();
    this.answer.reset('');
    this.answering.set(item.id);
    this.actions.focus(`#respuesta-${item.id}`);
  }

  protected cancelAnswer(item: CompanyRequest): void {
    this.close();
    this.actions.focus(`[data-accion="abrir-${item.id}"]`);
  }

  protected askAnswer(event: Event, item: CompanyRequest): void {
    event.preventDefault();
    this.failed.set(this.answer.invalid);
    if (this.answer.invalid) this.actions.focus(`#respuesta-${item.id}`);
    else this.actions.ask(`registrar-${item.id}`);
  }

  protected register(item: CompanyRequest): void {
    this.run(`registrar-${item.id}`, this.api.answer(item.id, this.answer.value.trim()), 'Registraste la respuesta. Se borraron el nombre y el correo.');
  }

  protected startRetire(item: CompanyRequest): void {
    if (this.actions.busy() !== null) return;
    this.close();
    this.retiring.set(item.id);
  }

  protected cancelRetire(item: CompanyRequest): void {
    this.close();
    this.actions.focus(`[data-accion="retirar-${item.id}"]`);
  }

  protected retire(item: CompanyRequest, { categoria, motivo }: Rejection): void {
    if (!item.resena) return;
    this.run(`retirar-${item.id}`, this.api.retire(item.resena.id, categoria, motivo), 'Retiraste la reseña. Respondé la solicitud para cerrarla.');
  }

  private close(): void {
    this.answering.set(null);
    this.retiring.set(null);
    this.failed.set(false);
    this.actions.confirming.set(null);
  }

  private run(key: string, action: ReturnType<ModerationAdminApi['answer']>, success: string): void {
    this.actions.run(key, action, success, {
      done: () => {
        this.close();
        // Si era la única de la página, se vuelve a la anterior.
        if (this.tab() === 'pendiente' && this.data()?.data.length === 1 && this.page() > 1) this.page.update((page) => page - 1);
        else this.requests.reload();
        this.actions.focus('h1');
      },
    });
  }
}
