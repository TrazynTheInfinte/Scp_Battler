import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6666',
  name: 'SCP-6666',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Thaumic', 'Biological'],
  stats: { template: 'physicalBruiser' },
  moves: ['spear-of-hector', 'rend', 'crimson-residue', 'ambush'],
  signatureMove: phys('spear-of-hector', 'Spear of Hector', 'Thaumic', 95, 100),
  ability: 'rootSnare',
  eligibility: "A six-armed demon with a spear fused to his arm, bound in a vast dead tree whose roots drag people under.",
  dossier: {
    nickname: "The Demon Hector and the Dread Titania",
    authors: "djkaktus",
    images: [],
  },
} satisfies ScpDefinition
