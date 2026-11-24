import { ChangeDetectionStrategy, Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

/** Contraseña con botón para mostrarla u ocultarla. La ayuda y los errores van como contenido, debajo del campo. */
@Component({
  selector: 'app-password-field',
  imports: [ReactiveFormsModule, LucideEye, LucideEyeOff],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; }
    .mb-field { width: 100%; }
    .mb-field label { font-size: 15px; line-height: 22px; }
    .box { position: relative; }
    .mb-input { height: 52px; padding-right: 56px; font-size: 17px; }
    button {
      position: absolute; top: 4px; right: 4px; width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0;
      border: 0; border-radius: var(--radio-sm); background: transparent; color: var(--noche); cursor: pointer;
    }
    button:focus-visible { outline: 2px solid var(--azul-texto); outline-offset: -2px; }
  `,
  template: `
    <div class="mb-field" [class.mb-field-error]="invalid()">
      <label [for]="fieldId()">{{ label() }}</label>
      <div class="box">
        <input
          #field
          class="mb-input"
          [id]="fieldId()"
          [type]="visible() ? 'text' : 'password'"
          [autocomplete]="autocomplete()"
          [formControl]="control()"
          [attr.aria-invalid]="invalid() ? true : null"
          [attr.aria-describedby]="describedBy() || null"
        />
        <button type="button" [attr.aria-label]="visible() ? 'Ocultar contraseña' : 'Mostrar contraseña'" (click)="visible.set(!visible())">
          @if (visible()) { <svg lucideEyeOff [size]="20" aria-hidden="true"></svg> } @else { <svg lucideEye [size]="20" aria-hidden="true"></svg> }
        </button>
      </div>
      <ng-content />
    </div>
  `,
})
export class PasswordField {
  readonly control = input.required<FormControl<string>>();
  readonly fieldId = input.required<string>();
  readonly label = input('Contraseña');
  readonly autocomplete = input<'current-password' | 'new-password'>('current-password');
  readonly invalid = input(false);
  readonly describedBy = input<string>();

  protected readonly visible = signal(false);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  focus(): void {
    this.field().nativeElement.focus();
  }
}
