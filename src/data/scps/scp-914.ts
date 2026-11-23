import { status, self } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-914',
  name: 'SCP-914',
  objectClass: 'Safe',
  types: ['Mechanical', 'Reality'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 90, atk: 60, def: 100, spa: 100, spd: 70, spe: 30 } },
  moves: ['gear-grind', 'refine', 'coarse', 'very-fine'],
  signatureMove: status('very-fine', 'Very Fine', 'Mechanical', null, [self({ spa: 2 })]),
  ability: 'precisionEngineering',
  eligibility: 'Iconic; it actively transforms anything put through it.',
  dossier: {
    nickname: 'The Clockworks',
    authors: 'Dr Gears',
    images: [
      { file: 'gears.jpg', author: 'Thomas Claveirole', license: 'CC BY-SA 2.0' },
    ],
    art: 'gears.jpg',
  },
} satisfies ScpDefinition
