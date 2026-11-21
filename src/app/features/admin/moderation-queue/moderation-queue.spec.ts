import { QueueItem } from '../../../core/models/moderation';
import { sortedScores } from './moderation-queue';

describe('sortedScores', () => {
  it('ordena las confianzas de mayor a menor, en porcentaje', () => {
    const item = { senales: { scores: { DP: 0, TER: 0.62, ACU: 0.71, INS: 0.05, SPAM: 0, TEMA: 0.004 } } } as QueueItem;
    const scores = sortedScores(item);
    expect(scores.slice(0, 3)).toEqual([
      { category: 'ACU', label: 'Acusación de delito', percent: 71 },
      { category: 'TER', label: 'Persona identificable', percent: 62 },
      { category: 'INS', label: 'Insulto o discriminación', percent: 5 },
    ]);
    expect(scores).toHaveLength(6);
  });

  it('sin respuesta del modelo no hay confianzas', () => {
    expect(sortedScores({ senales: { scores: null } } as QueueItem)).toEqual([]);
    expect(sortedScores({ senales: null } as QueueItem)).toEqual([]);
  });
});
