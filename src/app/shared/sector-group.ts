/** Grupo de rubro: reúne las secciones CIIU Rev. 4 en seis grupos. Define el color del sello y las fichas del directorio. */
export type SectorGroup = 'comercio' | 'industria' | 'servicios' | 'gastronomia' | 'transporte' | 'agro-otros';

/** Secciones CIIU de cada grupo (decisión del 23/11/2026). */
const SECTIONS: Record<SectorGroup, string> = {
  comercio: 'G',
  industria: 'BCDEF',
  servicios: 'JKLMNOPQRTU',
  gastronomia: 'I',
  transporte: 'H',
  'agro-otros': 'AS',
};

export interface SectorGroupInfo {
  nombre: string;
  /** Ilustración de public/marca/iconos. */
  ilustracion: string;
}

export const SECTOR_GROUPS: Record<SectorGroup, SectorGroupInfo> = {
  comercio: { nombre: 'Comercio', ilustracion: '14-despensa' },
  industria: { nombre: 'Industria y construcción', ilustracion: '11-obrero' },
  servicios: { nombre: 'Servicios y oficinas', ilustracion: '18-trabajo-en-equipo' },
  gastronomia: { nombre: 'Gastronomía', ilustracion: '10-olla-popular' },
  transporte: { nombre: 'Transporte', ilustracion: '15-colectivo' },
  'agro-otros': { nombre: 'Agro y otros', ilustracion: '12-herramientas' },
};

/** Grupo de una sección CIIU. Un código vacío o desconocido va a «Agro y otros». */
export function sectorGroup(ciiu: string | null | undefined): SectorGroup {
  const letter = ciiu?.trim().charAt(0).toUpperCase();
  if (!letter) return 'agro-otros';
  const found = (Object.keys(SECTIONS) as SectorGroup[]).find((group) => SECTIONS[group].includes(letter));
  return found ?? 'agro-otros';
}
