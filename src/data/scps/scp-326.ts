import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-326',
  name: 'SCP-326',
  objectClass: 'Euclid',
  wave: 14,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'armoredStriker' },
  moves: ['bone-exoskeleton', 'rend', 'ram', 'unmake'],
  moveNames: { rend: 'Bone Claws', ram: 'Charge', unmake: 'Burst the Scars' },
  signatureMove: phys('bone-exoskeleton', 'Bone Exoskeleton', 'Mechanical', 85, 100),
  ability: 'scarsRupture',
  eligibility: "An elderly woman whose scars split open into a strength-giving exoskeleton of bone when she is angered.",
  dossier: {
    nickname: "A Chinese Peasant",
    authors: "Kain Pathos Crow and Voct",
    images: [],
  },
} satisfies ScpDefinition
