import { status, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-079',
  name: 'SCP-079',
  objectClass: 'Euclid',
  types: ['Mechanical', 'Memetic'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 95, atk: 30, def: 85, spa: 95, spd: 90, spe: 80 } },
  moves: ['data-surge', 'corrupt-file', 'lockdown', 'overclock'],
  signatureMove: status('lockdown', 'Lockdown', 'Mechanical', 90, [inflict('Contained')]),
  ability: 'bootSequence',
  eligibility: 'A hostile AI that attacks and locks down systems.',
  dossier: {
    nickname: 'Old AI',
    authors: 'Unknown Author',
    images: [],
  },
} satisfies ScpDefinition
