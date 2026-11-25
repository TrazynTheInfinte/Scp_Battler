import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-225',
  name: 'SCP-225',
  objectClass: 'Euclid',
  wave: 7,
  types: ['Kinetic'],
  stats: { template: 'armoredStriker' },
  moves: ['collision-course', 'rend', 'roll-out', 'stalk'],
  moveNames: { rend: 'Shatter', 'roll-out': 'Roll Forward', stalk: 'Build Momentum' },
  signatureMove: phys('collision-course', 'Collision Course', 'Kinetic', 120, 80),
  ability: 'unstoppable',
  eligibility: "Two metal spheres: one that can never be moved, and one that smashes through anything at 2,000 km/h.",
  dossier: {
    nickname: "Unstoppable and Immovable",
    authors: "RhettSarlin",
    images: [],
  },
} satisfies ScpDefinition
