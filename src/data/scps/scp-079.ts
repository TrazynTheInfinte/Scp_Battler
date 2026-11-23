import { status, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-079',
  name: 'SCP-079',
  objectClass: 'Euclid',
  wave: 1,
  types: ['Mechanical', 'Memetic'],
  stats: { template: 'specialBruiser', tweaks: { hp: 6, atk: -7, def: 10, spa: -11, spd: 2 } },
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
