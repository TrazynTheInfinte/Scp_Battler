import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-114',
  name: 'SCP-114',
  objectClass: 'Euclid',
  wave: 5,
  types: ['Memetic'],
  stats: { template: 'support' },
  moves: ['frenzy-wave', 'smite', 'calming-ooze', 'sedative'],
  moveNames: { smite: 'Incite', 'calming-ooze': 'False Peace', sedative: 'Overwhelm' },
  signatureMove: spec('frenzy-wave', 'Frenzy Wave', 'Memetic', 80, 100, [foe({ def: -1 }, 30)]),
  ability: 'eyeOfTheStorm',
  eligibility: "Everyone near her turns violent toward each other, and none of them can bring themselves to hurt her.",
  dossier: {
    nickname: "Bringer of Conflict",
    authors: "Unknown Author, rewritten by bleggs",
    images: [],
  },
} satisfies ScpDefinition
