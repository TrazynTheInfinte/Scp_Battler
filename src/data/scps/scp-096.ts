import { status, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-096',
  name: 'SCP-096',
  objectClass: 'Euclid',
  types: ['Memetic'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 85, atk: 85, def: 70, spa: 65, spd: 70, spe: 100 } },
  moves: ['rend', 'relentless-pursuit', 'unveiled-face', 'weep'],
  signatureMove: status('unveiled-face', 'Unveiled Face', 'Memetic', 90, [inflict('Stunned')]),
  ability: 'enraged',
  eligibility: 'A hostile entity that hunts anyone who sees its face.',
  dossier: {
    nickname: 'The "Shy Guy"',
    authors: 'Dr Dan',
    images: [],
  },
} satisfies ScpDefinition
