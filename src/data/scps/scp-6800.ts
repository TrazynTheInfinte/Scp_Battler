import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6800',
  name: 'SCP-6800',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Thaumic', 'Temporal'],
  stats: { template: 'mixedAttacker' },
  moves: ['crying-bullet', 'flank', 'corrosive-touch', 'rend'],
  signatureMove: phys('crying-bullet', 'Crying Bullet', 'Thaumic', 85, 100, [inflict('Stunned', 20)]),
  ability: 'nameStealer',
  eligibility: "Name-stealing fae, and the heat-giving metal forged from them to survive an endless blizzard.",
  dossier: {
    nickname: "The White Ashes",
    authors: "Marceline_Raynes",
    images: [],
  },
} satisfies ScpDefinition
