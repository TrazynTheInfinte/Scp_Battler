import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-343',
  name: 'SCP-343',
  objectClass: 'Safe',
  types: ['Reality', 'Temporal'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 100, atk: 60, def: 70, spa: 110, spd: 80, spe: 30 } },
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
