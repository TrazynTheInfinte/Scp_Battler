import { phys, self } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-018',
  name: 'SCP-018',
  objectClass: 'Euclid',
  wave: 3,
  types: ['Kinetic'],
  stats: { template: 'fastPhysical' },
  moves: ['ricochet', 'ram', 'roll-out', 'flank'],
  signatureMove: phys('ricochet', 'Ricochet', 'Kinetic', 70, 100, [self({ spe: 1 })]),
  ability: 'superelastic',
  eligibility: "A ball that bounces back with more energy every time, until it moves fast enough to injure people.",
  dossier: {
    nickname: 'Super Ball',
    authors: 'Epic Phail Spy',
    images: [],
  },
} satisfies ScpDefinition
