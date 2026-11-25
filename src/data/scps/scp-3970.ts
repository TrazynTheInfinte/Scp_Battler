import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-3970',
  name: 'SCP-3970',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'wall' },
  moves: ['school-lockdown', 'ram', 'roll-out', 'flank'],
  signatureMove: phys('school-lockdown', 'School Lockdown', 'Mechanical', 75, 100, [inflict('Contained', 30)]),
  ability: 'doorsSlamShut',
  eligibility: "A sapient school building that moves its own walls and doors, and now runs as a containment site.",
  dossier: {
    nickname: "i want to contain too",
    authors: "DrZinc and Endren",
    images: [],
  },
} satisfies ScpDefinition
