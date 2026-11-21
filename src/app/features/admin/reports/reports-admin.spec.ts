import { ReportedReview } from '../../../core/models/moderation';
import { mostReported } from './reports-admin';
import { mailtoLink } from '../company-requests/requests-admin';
import { CompanyRequest } from '../../../core/models/moderation';

describe('Administración de reportes y solicitudes', () => {
  it('propone la categoría más reportada, sin contar «Otro»', () => {
    const item = { reportes: [{ categoria: 'OTRO' }, { categoria: 'INS' }, { categoria: 'TER' }, { categoria: 'INS' }] } as ReportedReview;
    expect(mostReported(item)).toBe('INS');
    expect(mostReported({ reportes: [{ categoria: 'OTRO' }] } as ReportedReview)).toBe('TER');
  });

  it('arma el enlace de correo con el asunto y la respuesta escrita', () => {
    const request = { tipo: 'revision_resena', correo: 'empresa@ejemplo.com' } as CompanyRequest;
    const link = mailtoLink(request, 'Revisamos la reseña y sigue publicada.');
    expect(link.startsWith('mailto:empresa%40ejemplo.com?subject=')).toBe(true);
    expect(decodeURIComponent(link)).toContain('Revisamos la reseña y sigue publicada.');
  });
});
