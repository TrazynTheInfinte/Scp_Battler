import { status, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-012',
  name: 'SCP-012',
  objectClass: 'Euclid',
  wave: 1,
  types: ['Memetic', 'Thaumic'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 70, atk: 50, def: 70, spa: 105, spd: 100, spe: 80 } },
  moves: ['dissonant-chord', 'blood-ink', 'unfinished-score', 'crescendo'],
  signatureMove: status('unfinished-score', 'Unfinished Score', 'Memetic', 85, [inflict('Amnesiac')]),
  ability: 'morbidAllure',
  eligibility: 'An active cognitohazard that compels harm.',
  dossier: {
    nickname: 'A Bad Composition',
    authors: 'ITIFAMCO',
    images: [],
  },
} satisfies ScpDefinition
