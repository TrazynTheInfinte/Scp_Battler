import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-165',
  name: 'SCP-165',
  objectClass: 'Keter',
  wave: 6,
  types: ['Biological', 'Temporal'],
  stats: { template: 'balanced' },
  moves: ['flesh-strip', 'corrosive-touch', 'crimson-residue', 'stalk'],
  moveNames: { 'corrosive-touch': 'Scouring Sand', 'crimson-residue': 'Flaying Swarm', stalk: 'Creeping Dunes' },
  signatureMove: phys('flesh-strip', 'Flesh Strip', 'Biological', 85, 100, [inflict('Bleeding', 20)]),
  ability: 'hungrySands',
  eligibility: "A dune of mites that swarms its prey, numbs it, and strips it to the bone in minutes.",
  dossier: {
    nickname: "The Creeping, Hungry Sands of Tule",
    authors: "FritzWillie",
    images: [],
  },
} satisfies ScpDefinition
