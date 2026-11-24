import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-1717-ex',
  name: 'SCP-1717-EX',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Mundane'],
  stats: { template: 'physicalBruiser' },
  moves: ['breach-strike', 'bludgeon', 'quick-jab', 'brace'],
  signatureMove: phys('breach-strike', 'Breach Strike', 'Mundane', 95, 95),
  ability: 'podHunters',
  eligibility: "Orcas that became sapient through ordinary evolution: apex predators, now thinking ones.",
  dossier: {
    nickname: "I Am Everything I Said I Was",
    authors: "Plilt",
    images: [],
  },
} satisfies ScpDefinition
