import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-4690',
  name: 'SCP-4690',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Memetic', 'Biological'],
  stats: { template: 'fastPhysical' },
  moves: ['eaten-alive', 'relentless-pursuit', 'ambush', 'crimson-residue'],
  signatureMove: phys('eaten-alive', 'Eaten Alive', 'Biological', 85, 100, [inflict('Bleeding', 30)]),
  ability: 'spiderNest',
  eligibility: "A pattern that rewrites every retelling of an old novel so that spiders devour its hero.",
  dossier: {
    nickname: "Lieutenant Pinkerton Eaten Alive by Fucking Spiders",
    authors: "UraniumEmpire",
    images: [],
  },
} satisfies ScpDefinition
