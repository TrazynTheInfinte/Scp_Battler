import { status, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-096',
  name: 'SCP-096',
  objectClass: 'Euclid',
  wave: 1,
  types: ['Memetic'],
  stats: { template: 'balanced', tweaks: { hp: 3, atk: 3, def: -5, spa: -8, spd: -5, spe: 12 } },
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
