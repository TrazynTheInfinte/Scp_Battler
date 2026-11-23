import { status, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-053',
  name: 'SCP-053',
  objectClass: 'Euclid',
  wave: 3,
  types: ['Memetic'],
  stats: { template: 'support' },
  moves: ['hostile-compulsion', 'contagious-joy', 'regenerate', 'calming-ooze'],
  signatureMove: status('hostile-compulsion', 'Hostile Compulsion', 'Memetic', 90, [inflict('Stunned')]),
  ability: 'untouchable',
  eligibility: "Anyone who hurts her dies within seconds, and her wounds close almost at once.",
  dossier: {
    nickname: 'Young Girl',
    authors: 'Dr Gears',
    images: [],
  },
} satisfies ScpDefinition
