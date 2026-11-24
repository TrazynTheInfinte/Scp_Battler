import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-160',
  name: 'SCP-160',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'fastPhysical' },
  moves: ['proboscis-dive', 'roll-out', 'flank', 'overclock'],
  signatureMove: phys('proboscis-dive', 'Proboscis Dive', 'Mechanical', 85, 100, [inflict('Bleeding', 20)]),
  ability: 'airborne',
  eligibility: "An autonomous drone that dives on prey, impales it with a proboscis, and injects something caustic.",
  dossier: {
    nickname: "Predator Drone",
    authors: "Aelanna",
    images: [],
  },
} satisfies ScpDefinition
