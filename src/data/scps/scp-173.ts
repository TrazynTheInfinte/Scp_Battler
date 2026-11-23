import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-173',
  name: 'SCP-173',
  objectClass: 'Euclid',
  wave: 1,
  types: ['Kinetic', 'Antimemetic'],
  stats: { template: 'armoredStriker', tweaks: { def: -1, spe: 1 } },
  moves: ['neck-snap', 'blink', 'crimson-residue', 'stalk'],
  signatureMove: phys('neck-snap', 'Neck Snap', 'Kinetic', 100, 85),
  ability: 'unobserved',
  eligibility: 'A hostile entity that kills when unobserved.',
  dossier: {
    nickname: 'The Sculpture',
    authors: 'Moto42',
    images: [],
  },
} satisfies ScpDefinition
