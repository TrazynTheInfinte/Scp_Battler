import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-343',
  name: 'SCP-343',
  objectClass: 'Safe',
  wave: 1,
  types: ['Reality', 'Temporal'],
  stats: { template: 'slowSpecial', tweaks: { hp: 6, def: -16, spa: 5, spd: 5 } },
  moves: ['rewrite', 'smite', 'turn-back-time', 'divine-calm'],
  signatureMove: spec('rewrite', 'Rewrite', 'Reality', 80, 100),
  ability: 'willingDetainee',
  eligibility: 'An entity with reality-altering powers.',
  dossier: {
    nickname: '"God"',
    authors: 'Unknown Author',
    images: [],
  },
} satisfies ScpDefinition
