import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-511',
  name: 'SCP-511',
  objectClass: 'Euclid',
  wave: 17,
  types: ['Antimemetic', 'Kinetic'],
  stats: { template: 'fastPhysical' },
  moves: ['basement-pounce', 'flurry', 'ambush', 'rend'],
  moveNames: { flurry: 'Colony Swarm', ambush: 'From the Crawlspace', rend: 'Claws Out' },
  signatureMove: phys('basement-pounce', 'Basement Pounce', 'Antimemetic', 80, 100, [foe({ def: -1 }, 30)]),
  ability: 'nineLives',
  eligibility: "The thing in the basement, and the colony of feral cats that guards it and comes back from the dead.",
  dossier: {
    nickname: "Basement Cat",
    authors: "sandrewswann",
    images: [],
  },
} satisfies ScpDefinition
