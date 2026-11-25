import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-7030',
  name: 'SCP-7030',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Antimemetic', 'Temporal'],
  stats: { template: 'slowSpecial' },
  moves: ['crystallize', 'decay', 'negative-space', 'obscure'],
  moveNames: { decay: 'Erosion of Time', 'negative-space': 'Vanishing', obscure: 'Crystal Glare' },
  signatureMove: spec('crystallize', 'Crystallize', 'Antimemetic', 90, 100, [inflict('Stunned', 20)]),
  ability: 'scalingStatues',
  eligibility: "People vanishing from every reality, leaving behind crystal statues that keep growing.",
  dossier: {
    nickname: "What Comes to Pass",
    authors: "weizhong",
    images: [],
  },
} satisfies ScpDefinition
