import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-428',
  name: 'SCP-428',
  objectClass: 'Euclid',
  wave: 15,
  types: ['Memetic', 'Biological'],
  stats: { template: 'physicalBruiser' },
  moves: ['crush-of-bodies', 'relentless-pursuit', 'crimson-residue', 'unmake'],
  moveNames: { 'relentless-pursuit': 'Shambling Mob', 'crimson-residue': 'Hollow Grasp', unmake: 'Absorb' },
  signatureMove: phys('crush-of-bodies', 'Crush of Bodies', 'Memetic', 85, 100),
  ability: 'manyHands',
  eligibility: "A huddle of hollowed-out people that moves as one and hunts others to join it.",
  dossier: {
    nickname: "The Crowd",
    authors: "DrScooter",
    images: [],
  },
} satisfies ScpDefinition
