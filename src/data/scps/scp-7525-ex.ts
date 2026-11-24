import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-7525-ex',
  name: 'SCP-7525-EX',
  objectClass: 'Safe',
  wave: 6,
  types: ['Mundane'],
  stats: { template: 'fastPhysical' },
  moves: ['goblin-bite', 'quick-jab', 'bludgeon', 'pepper-spray'],
  signatureMove: phys('goblin-bite', 'Goblin Bite', 'Mundane', 90, 95, [foe({ def: -1 }, 30)]),
  ability: 'spiteful',
  eligibility: "A cranky automaton guarding a database slot, which bit and punched an agent before it was shut down.",
  dossier: {
    nickname: "The Slot Goblin",
    authors: "PlaguePJP and HarryBlank",
    images: [],
  },
} satisfies ScpDefinition
