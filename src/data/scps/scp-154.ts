import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-154',
  name: 'SCP-154',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Kinetic', 'Thaumic'],
  stats: { template: 'fastPhysical' },
  moves: ['bone-arrow', 'ambush', 'flank', 'overclock'],
  signatureMove: phys('bone-arrow', 'Bone Arrow', 'Kinetic', 90, 95),
  ability: 'regrowingBones',
  eligibility: "Bracelets that form a bow which fires its wielder's own arm bones, which then regrow.",
  dossier: {
    nickname: "Offensive Bracelets",
    authors: "Kain Pathos Crow",
    images: [],
  },
} satisfies ScpDefinition
