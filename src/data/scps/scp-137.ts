import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-137',
  name: 'SCP-137',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Memetic', 'Reality'],
  stats: { template: 'balanced' },
  moves: ['toy-soldier', 'refine', 'contagious-joy', 'weep'],
  signatureMove: phys('toy-soldier', 'Toy Soldier', 'Memetic', 85, 100),
  ability: 'makeBelieve',
  eligibility: "An entity that possesses toys and makes them real: toy soldiers become armed men, toy lions maul.",
  dossier: {
    nickname: "The Real Toy",
    authors: "DrEverettMann and Arlecchino",
    images: [],
  },
} satisfies ScpDefinition
