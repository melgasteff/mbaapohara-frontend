import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Company, Office } from '../../../core/models/company';
import { CatalogItem, CriteriaConfig, Job, MyReview, ReviewDraft, WorkSituation } from '../../../core/models/review';

export const CURRENT_YEAR = new Date().getFullYear();
/** Valor del select de cargo para «Mi cargo no está en la lista». */
export const OTHER_JOB = 'otro';

/** Largo mínimo sin contar los espacios de los extremos. */
function minTrimmed(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const length = String(control.value ?? '').trim().length;
    return length > 0 && length < min ? { minlength: { requiredLength: min, actualLength: length } } : null;
  };
}

/** Formulario del asistente: un grupo por paso, para validar cada paso por separado. */
export function createReviewForm() {
  return new FormGroup({
    lugar: new FormGroup({
      empresa: new FormControl<Company | null>(null, Validators.required),
      local: new FormControl<Office | null>(null, Validators.required),
    }),
    relacion: new FormGroup({
      cargo: new FormControl<number | typeof OTHER_JOB | null>(null, Validators.required),
      cargoNuevo: new FormControl('', { nonNullable: true }),
      situacion: new FormControl<WorkSituation | null>(null, Validators.required),
      ultimoAnio: new FormControl<number | null>(null),
      tipoContrato: new FormControl<number | null>(null, Validators.required),
      modalidad: new FormControl<number | null>(null, Validators.required),
    }),
    // Un control por criterio; se agregan al llegar el JSON (applyCriteriaConfig).
    criterios: new FormGroup<Record<string, FormControl<string | null>>>({}),
    texto: new FormGroup({
      calificacion: new FormControl<number | null>(null, Validators.required),
      loBueno: new FormControl('', { nonNullable: true, validators: Validators.required }),
      aMejorar: new FormControl('', { nonNullable: true, validators: Validators.required }),
      // Reglas de publicación (política de moderación, sección 3): aceptarlas es obligatorio.
      aceptaReglas: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
    }),
  });
}

export type ReviewForm = ReturnType<typeof createReviewForm>;

/** Agrega los criterios del JSON como controles obligatorios y aplica los límites de los textos. */
export function applyCriteriaConfig(form: ReviewForm, config: CriteriaConfig): void {
  for (const category of config.categorias) {
    for (const item of category.items) {
      if (!form.controls.criterios.contains(item.codigo)) {
        form.controls.criterios.addControl(item.codigo, new FormControl<string | null>(null, Validators.required));
      }
    }
  }
  for (const field of config.textos) {
    const control = field.codigo === 'LO_BUENO' ? form.controls.texto.controls.loBueno : form.controls.texto.controls.aMejorar;
    control.setValidators([Validators.required, minTrimmed(field.minimo), Validators.maxLength(field.maximo)]);
    control.updateValueAndValidity();
  }
}

/** Campos que dependen de otros: el cargo propuesto y el último año (solo si ya no trabaja ahí). */
export function linkConditionalFields(form: ReviewForm, destroyRef: DestroyRef): void {
  const { cargo, cargoNuevo, situacion, ultimoAnio } = form.controls.relacion.controls;
  const { empresa, local } = form.controls.lugar.controls;

  cargo.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe((value) => {
    cargoNuevo.setValidators(value === OTHER_JOB ? [Validators.required, minTrimmed(2), Validators.maxLength(80)] : null);
    cargoNuevo.updateValueAndValidity();
  });
  situacion.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe((value) => {
    ultimoAnio.setValidators(value === 'ANTERIOR' ? Validators.required : null);
    ultimoAnio.updateValueAndValidity();
  });
  // Otro local pertenece a otra empresa: al cambiar de empresa se vuelve a elegir.
  empresa.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe((value) => {
    if (local.value && local.value.idEmpresa !== value?.id) local.reset();
  });
}

/** Listas de la API que hacen falta para nombrar los ids en la vista previa. */
export interface DraftLookups {
  jobs: Job[];
  contractTypes: CatalogItem[];
  workModes: CatalogItem[];
}

/** Arma la reseña a partir de un formulario válido. */
export function toDraft(form: ReviewForm, lookups: DraftLookups): ReviewDraft {
  const { lugar, relacion, criterios, texto } = form.getRawValue();
  const job = lookups.jobs.find((item) => item.id === relacion.cargo);
  return {
    empresa: { id: lugar.empresa!.id, nombre: lugar.empresa!.nombre },
    local: { id: lugar.local!.id, nombre: lugar.local!.nombre, ciudad: lugar.local!.ciudad.nombre },
    cargo: job ? { id: job.id, nombre: job.descripcion } : { id: null, nombre: relacion.cargoNuevo.trim() },
    situacion: relacion.situacion!,
    ultimoAnio: relacion.situacion === 'ACTUAL' ? CURRENT_YEAR : relacion.ultimoAnio!,
    tipoContrato: lookups.contractTypes.find((item) => item.id === relacion.tipoContrato)!,
    modalidad: lookups.workModes.find((item) => item.id === relacion.modalidad)!,
    respuestas: criterios as Record<string, string>,
    calificacion: texto.calificacion!,
    loBueno: texto.loBueno.trim(),
    aMejorar: texto.aMejorar.trim(),
  };
}

/** Metadatos sin género para la tarjeta: «Trabajó aquí · Cajera · Asunción · hasta 2025». */
export function draftMeta(draft: ReviewDraft): string[] {
  return [
    draft.situacion === 'ACTUAL' ? 'Trabaja aquí' : 'Trabajó aquí',
    draft.cargo.nombre,
    ...(draft.local.ciudad ? [draft.local.ciudad] : []),
    ...(draft.situacion === 'ANTERIOR' ? [`hasta ${draft.ultimoAnio}`] : []),
  ];
}

/**
 * Carga en el formulario la última versión de una reseña propia, para editarla. Los criterios tienen que estar
 * aplicados antes (applyCriteriaConfig). El local no se edita: se carga lo justo para la vista previa y el envío.
 * Un cargo propuesto que todavía no está en la lista vuelve como «Mi cargo no está en la lista», con su texto.
 */
export function fromMyReview(form: ReviewForm, review: MyReview, jobs: Job[]): void {
  const v = review.ultimaVersion;
  const listed = v.cargo.aprobado && jobs.some((job) => job.id === v.cargo.id);
  const empresa = { id: review.empresa.id, nombre: review.empresa.nombre } as Company;
  const local = {
    id: review.local.id,
    nombre: review.local.nombre,
    idEmpresa: review.empresa.id,
    ciudad: { nombre: review.local.ciudad },
  } as Office;
  const criterios: Record<string, string> = {};
  for (const { codigo, respuesta } of v.respuestas) {
    // Un criterio que ya no se usa no tiene control: se ignora.
    if (form.controls.criterios.contains(codigo)) criterios[codigo] = respuesta;
  }
  form.patchValue({
    lugar: { empresa, local },
    relacion: {
      cargo: listed ? v.cargo.id : OTHER_JOB,
      cargoNuevo: listed ? '' : v.cargo.descripcion,
      situacion: v.situacion,
      ultimoAnio: v.situacion === 'ANTERIOR' ? v.ultimoAnio : null,
      tipoContrato: v.tipoContrato.id,
      modalidad: v.modalidad.id,
    },
    criterios,
    // Las reglas de publicación se vuelven a aceptar en cada envío.
    texto: { calificacion: v.calificacion, loBueno: v.loBueno, aMejorar: v.aMejorar, aceptaReglas: false },
  });
}
