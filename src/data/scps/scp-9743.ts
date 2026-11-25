import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-9743',
  name: 'SCP-9743',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Reality', 'Thaumic'],
  stats: { template: 'support' },
  moves: ['judgment', 'blinding-light', 'refine', 'unmake'],
  signatureMove: phys('judgment', 'Judgment', 'Thaumic', 85, 100, [inflict('Contained', 30)]),
  ability: 'handsOfJudgment',
  eligibility: "A divine remaking of the world, where floating hands seize the wicked and violence turns back on attackers.",
  dossier: {
    nickname: "This uTopia?",
    authors: "ApothecaryCat21 and Proasek",
    images: [],
  },
} satisfies ScpDefinition
