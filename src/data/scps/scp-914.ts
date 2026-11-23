import { status, self } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-914',
  name: 'SCP-914',
  objectClass: 'Safe',
  wave: 1,
  types: ['Mechanical', 'Reality'],
  stats: { template: 'slowSpecial', tweaks: { hp: -4, def: 14, spa: -5, spd: -5 } },
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
