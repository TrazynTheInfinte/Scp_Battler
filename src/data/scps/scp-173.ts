import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-173',
  name: 'SCP-173',
  objectClass: 'Euclid',
  types: ['Kinetic', 'Antimemetic'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 75, atk: 115, def: 110, spa: 20, spd: 55, spe: 100 } },
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
