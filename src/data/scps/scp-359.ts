import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-359',
  name: 'SCP-359',
  objectClass: 'Euclid',
  wave: 14,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'fastPhysical' },
  moves: ['steel-talons', 'flank', 'ambush', 'unmake'],
  moveNames: { flank: 'Night Swoop', ambush: 'Silent Dive', unmake: 'Carry Off' },
  signatureMove: phys('steel-talons', 'Steel Talons', 'Mechanical', 85, 100),
  ability: 'huntersEye',
  eligibility: "A metal hawk sculpture with a 4-metre wingspan that comes alive at night and attacks anything that moves.",
  dossier: {
    nickname: "The Hawk",
    authors: "apocalemur and TopDownUnder",
    images: [],
  },
} satisfies ScpDefinition
