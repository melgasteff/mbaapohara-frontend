/** Grupo de rubro: reúne las secciones CIIU en seis grupos. Lo calcula la API (companies/sector-groups.ts). */
export type SectorGroup = 'comercio' | 'industria' | 'servicios' | 'gastronomia' | 'transporte' | 'agro-otros';

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
