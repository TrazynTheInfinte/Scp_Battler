import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6101',
  name: 'SCP-6101',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Kinetic', 'Reality'],
  stats: { template: 'fastSpecial' },
  moves: ['fear-and-loathing', 'smite', 'turn-back-time', 'obscure'],
  signatureMove: spec('fear-and-loathing', 'Fear and Loathing', 'Reality', 90, 100),
  ability: 'heidi',
  eligibility: "A flying, invisible, super-strong boy with two guns, Fear and Loathing, and a lethal guard dog.",
  dossier: {
    nickname: "The Most Powerful SCP",
    authors: "PeppersGhost",
    images: [],
  },
} satisfies ScpDefinition
