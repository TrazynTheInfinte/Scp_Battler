import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-323',
  name: 'SCP-323',
  objectClass: 'Euclid',
  wave: 14,
  types: ['Thaumic', 'Memetic'],
  stats: { template: 'fastPhysical' },
  moves: ['wendigo-hunger', 'crushing-jaws', 'stalk', 'unmake'],
  moveNames: { 'crushing-jaws': 'Feral Bite', stalk: 'Hunt', unmake: 'Rend the Host' },
  signatureMove: phys('wendigo-hunger', 'Wendigo Hunger', 'Thaumic', 85, 100, [inflict('Bleeding', 20)]),
  ability: 'takesHold',
  eligibility: "An antlered skull that turns whoever wears it into a starving, predatory wendigo.",
  dossier: {
    nickname: "Wendigo Skull",
    authors: "Wilt",
    images: [],
  },
} satisfies ScpDefinition
