import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-100',
  name: 'SCP-100',
  objectClass: 'Euclid',
  wave: 5,
  types: ['Mechanical', 'Reality'],
  stats: { template: 'balanced' },
  moves: ['scrap-construct', 'refine', 'coarse', 'overclock'],
  signatureMove: phys('scrap-construct', 'Scrap Construct', 'Mechanical', 85, 100),
  ability: 'guardConstructs',
  eligibility: "A construct of cans that builds animal constructs to guard and patrol its junkyard.",
  dossier: {
    nickname: "\"Jamaican Joe's Junkyard Jubilee\"",
    authors: "Wilt",
    images: [],
  },
} satisfies ScpDefinition
