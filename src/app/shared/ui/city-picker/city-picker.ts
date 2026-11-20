import { ChangeDetectionStrategy, Component, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CitiesApi } from '../../../core/api/cities-api';
import { DepartmentsApi } from '../../../core/api/departments-api';

let nextId = 0;

/**
 * Elegir una ciudad en dos pasos: departamento y después ciudad (la API devuelve 100 elementos por página).
 * El valor del control es el id de la ciudad.
 */
@Component({
  selector: 'app-city-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CityPicker), multi: true }],
  styles: `
    :host { display: grid; gap: var(--space-4); }
    @media (min-width: 600px) { :host { grid-template-columns: 1fr 1fr; } }
    .mb-field { width: 100%; }
  `,
  template: `
    <div class="mb-field" [class.mb-field-error]="invalid()">
      <label [for]="id + '-dep'">Departamento</label>
      <select class="mb-input" [id]="id + '-dep'" [disabled]="disabled()" (change)="selectDepartment(dep.value)" (blur)="onTouched()" #dep>
        <option value="" [selected]="!department()">Elegí el departamento</option>
        @for (item of departments.hasValue() ? departments.value().data : []; track item.id) {
          <option [value]="item.id" [selected]="item.id === department()">{{ item.nombre }}</option>
        }
      </select>
    </div>
    <div class="mb-field" [class.mb-field-error]="invalid()">
      <label [for]="id + '-city'">Ciudad</label>
      <select
        class="mb-input"
        [id]="id + '-city'"
        [disabled]="disabled() || !department()"
        [attr.aria-invalid]="invalid()"
        (change)="selectCity(city.value)"
        (blur)="onTouched()"
        #city
      >
        <option value="" [selected]="!value()">Elegí la ciudad</option>
        @for (item of cities.hasValue() ? cities.value().data : []; track item.id) {
          <option [value]="item.id" [selected]="item.id === value()">{{ item.nombre }}</option>
        }
      </select>
    </div>
  `,
})
export class CityPicker implements ControlValueAccessor {
  /** Marca los dos campos con error (lo decide el formulario que lo usa). */
  readonly invalid = input(false);

  private readonly citiesApi = inject(CitiesApi);
  protected readonly id = `ciudad-${nextId++}`;
  protected readonly department = signal<number | undefined>(undefined);
  protected readonly value = signal<number | null>(null);
  protected readonly disabled = signal(false);
  protected readonly departments = inject(DepartmentsApi).allResource();
  protected readonly cities = this.citiesApi.byDepartmentResource(this.department);

  private onChange: (value: number | null) => void = () => {};
  protected onTouched: () => void = () => {};

  protected selectDepartment(value: string): void {
    this.department.set(Number(value) || undefined);
    this.value.set(null);
    this.onChange(null);
  }

  protected selectCity(value: string): void {
    const id = Number(value) || null;
    this.value.set(id);
    this.onChange(id);
  }

  writeValue(value: number | null): void {
    this.value.set(value);
    if (!value) return;
    // Al editar, se busca el departamento de la ciudad para mostrar las dos listas.
    this.citiesApi.get(value).subscribe({ next: (city) => this.department.set(city.idDepartamento) });
  }
  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}
