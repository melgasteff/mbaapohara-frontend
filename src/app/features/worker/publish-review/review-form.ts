import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SavedDraft } from '../../../core/drafts/review-draft-store';
import { Company, CompanyDetail, Office } from '../../../core/models/company';
import { CatalogItem, CriteriaConfig, Job, MyReview, ReviewDraft, ReviewTextField, WorkSituation } from '../../../core/models/review';

export const CURRENT_YEAR = new Date().getFullYear();
/** Valor de `cargo` cuando lo escrito no está en la lista: el texto va en `cargoNuevo`. */
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

/** Compara sin mayúsculas, tildes ni espacios de más. */
function simple(text: string): string {
  return text.trim().replace(/\s+/g, ' ').normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es');
}

type Relation = ReviewForm['controls']['relacion'];

/** Cargo escrito: si coincide con uno de la lista se usa ese; si no, se propone como nuevo. */
export function setJobText(relacion: Relation, text: string, jobs: Job[]): void {
  const wanted = simple(text);
  const job = wanted ? jobs.find((item) => simple(item.descripcion) === wanted) : undefined;
  relacion.patchValue({ cargo: job ? job.id : wanted ? OTHER_JOB : null, cargoNuevo: job ? '' : text });
}

/** El cargo del formulario, como texto. */
export function jobText(relacion: { cargo: number | typeof OTHER_JOB | null; cargoNuevo: string }, jobs: Job[]): string {
  if (typeof relacion.cargo !== 'number') return relacion.cargoNuevo;
  return jobs.find((job) => job.id === relacion.cargo)?.descripcion ?? '';
}

export type FormValue = ReturnType<ReviewForm['getRawValue']>;

/** Metadatos sin género de la vista previa, como en el perfil: «Trabajó aquí · Cajera · Centro, Asunción · hasta 2025». */
export function previewMeta({ lugar, relacion }: FormValue, jobs: Job[]): string[] {
  const { local } = lugar;
  return [
    relacion.situacion === 'ACTUAL' ? 'Trabaja aquí' : 'Trabajó aquí',
    // Un cargo propuesto se muestra recién cuando el administrador lo aprueba.
    ...(relacion.cargo === OTHER_JOB ? ['Otro cargo'] : relacion.cargo !== null ? [jobText(relacion, jobs)] : []),
    ...(local ? [[local.nombre, local.ciudad.nombre].filter(Boolean).join(', ')] : []),
    ...(relacion.situacion === 'ANTERIOR' && relacion.ultimoAnio ? [`hasta ${relacion.ultimoAnio}`] : []),
  ];
}

/** Lo primero que falta en los pasos 1, 2 y 4, dicho para quien escribe; '' si no falta nada. */
export function missingMessage(form: ReviewForm, step: number, texts: ReviewTextField[]): string {
  const { lugar, relacion, texto } = form.controls;
  const first = (checks: [AbstractControl, string][]) => checks.find(([control]) => control.invalid)?.[1] ?? '';
  const tooShort = (code: ReviewTextField['codigo']) => {
    const field = texts.find((item) => item.codigo === code);
    return field ? `«${field.etiqueta}» necesita al menos ${field.minimo} caracteres.` : 'Completá los dos textos.';
  };
  switch (step) {
    case 1:
      return first([[lugar.controls.empresa, 'Elegí la empresa para seguir.'], [lugar.controls.local, 'Elegí el local donde trabajaste.']]);
    case 2:
      return first([
        [relacion.controls.cargo, 'Escribí tu cargo.'],
        [relacion.controls.cargoNuevo, 'Escribí tu cargo (al menos 2 letras).'],
        [relacion.controls.situacion, 'Contanos si seguís trabajando ahí.'],
        [relacion.controls.ultimoAnio, 'Elegí el último año en que trabajaste ahí.'],
        [relacion.controls.tipoContrato, 'Elegí el tipo de contrato.'],
        [relacion.controls.modalidad, 'Elegí la modalidad.'],
      ]);
    case 4:
      return first([
        [texto.controls.calificacion, 'Elegí de 1 a 5 estrellas.'],
        [texto.controls.loBueno, tooShort('LO_BUENO')],
        [texto.controls.aMejorar, tooShort('A_MEJORAR')],
        [texto.controls.aceptaReglas, 'Para enviar, aceptá las reglas de publicación.'],
      ]);
    default:
      return '';
  }
}

/** Lo que se guarda del formulario; sin empresa elegida todavía no hay nada que guardar. */
export function toSavedDraft(value: FormValue, paso: number, jobs: Job[]): SavedDraft | null {
  const { lugar, relacion, criterios, texto } = value;
  if (!lugar.empresa) return null;
  const answered = Object.entries(criterios).filter((entry): entry is [string, string] => !!entry[1]);
  return {
    paso,
    empresa: { id: lugar.empresa.id, nombre: lugar.empresa.nombre },
    idLocal: lugar.local?.id ?? null,
    cargo: jobText(relacion, jobs),
    situacion: relacion.situacion,
    ultimoAnio: relacion.ultimoAnio,
    tipoContrato: relacion.tipoContrato,
    modalidad: relacion.modalidad,
    respuestas: Object.fromEntries(answered),
    calificacion: texto.calificacion,
    loBueno: texto.loBueno,
    aMejorar: texto.aMejorar,
  };
}

/** ¿Se perdería algo al descartarlo? Haber elegido solo la empresa y el local no cuenta. */
export function hasContent(draft: SavedDraft): boolean {
  return !!(
    draft.cargo.trim() || draft.situacion || draft.tipoContrato || draft.modalidad || draft.calificacion ||
    Object.keys(draft.respuestas).length || draft.loBueno.trim() || draft.aMejorar.trim()
  );
}

/**
 * Carga un borrador. La empresa llega confirmada por la API (`null` si ya no está); lo que dejó de existir (un local, un
 * criterio, un contrato) queda sin elegir. Los criterios tienen que estar aplicados antes.
 */
export function fromSavedDraft(form: ReviewForm, draft: SavedDraft, company: CompanyDetail | null, lookups: DraftLookups): void {
  const exists = (items: CatalogItem[], id: number | null) => (items.some((item) => item.id === id) ? id : null);
  const criterios = Object.fromEntries(Object.entries(draft.respuestas).filter(([code]) => form.controls.criterios.contains(code)));
  form.patchValue({
    lugar: { empresa: company, local: company?.locales.find((office) => office.id === draft.idLocal) ?? null },
    relacion: {
      situacion: draft.situacion,
      ultimoAnio: draft.ultimoAnio,
      tipoContrato: exists(lookups.contractTypes, draft.tipoContrato),
      modalidad: exists(lookups.workModes, draft.modalidad),
    },
    criterios,
    texto: { calificacion: draft.calificacion, loBueno: draft.loBueno, aMejorar: draft.aMejorar, aceptaReglas: false },
  });
  setJobText(form.controls.relacion, draft.cargo, lookups.jobs);
}

/** Paso en el que se retoma: el guardado, o el primero al que todavía le falta algo. */
export function resumeStep(form: ReviewForm, saved: number): number {
  const { lugar, relacion, criterios, texto } = form.controls;
  const pending = [lugar, relacion, criterios, texto].findIndex((group) => group.invalid) + 1 || 4;
  return Math.min(Math.max(1, Math.trunc(saved)), pending);
}

/**
 * Carga en el formulario la última versión de una reseña propia, para editarla. Los criterios tienen que estar
 * aplicados antes (applyCriteriaConfig). El local no se edita: se carga lo justo para la vista previa y el envío.
 * Un cargo propuesto que todavía no está en la lista vuelve como texto propuesto.
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
