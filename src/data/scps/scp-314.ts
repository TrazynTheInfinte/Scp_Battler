import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-314',
  name: 'SCP-314',
  objectClass: 'Euclid',
  wave: 13,
  types: ['Kinetic', 'Temporal'],
  stats: { template: 'fastPhysical' },
  moves: ['molecular-edge', 'rend', 'flank', 'unmake'],
  moveNames: { rend: 'Slice', flank: 'Predictive Strike', unmake: 'Sever' },
  signatureMove: phys('molecular-edge', 'Molecular Edge', 'Kinetic', 85, 100, [inflict('Bleeding', 20)]),
  ability: 'motionSeeking',
  eligibility: "A levitating razor-edged obelisk that strikes at anything that moves within fifty metres.",
  dossier: {
    nickname: "Motion-Seeking Blade",
    authors: "Unknown Author and Sorts",
    images: [],
  },
} satisfies ScpDefinition
