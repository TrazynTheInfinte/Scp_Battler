import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-121',
  name: 'SCP-121',
  objectClass: 'Euclid',
  wave: 5,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['debris-slam', 'ram', 'roll-out', 'weep'],
  moveNames: { ram: 'Collapsing Wall', 'roll-out': 'Rubble Slide', weep: 'Cradle Song' },
  signatureMove: phys('debris-slam', 'Debris Slam', 'Mechanical', 90, 100),
  ability: 'accretion',
  eligibility: "A giant body built from the debris of a town, which grows more dangerous with each weapon it absorbs.",
  dossier: {
    nickname: "Concrete Cradle",
    authors: "Wilt",
    images: [],
  },
} satisfies ScpDefinition
