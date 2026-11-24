import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-133',
  name: 'SCP-133',
  objectClass: 'Safe',
  wave: 6,
  types: ['Kinetic'],
  stats: { template: 'fastPhysical' },
  moves: ['punch-through', 'blink', 'flank', 'stalk'],
  signatureMove: phys('punch-through', 'Punch Through', 'Kinetic', 80, null),
  ability: 'breakingAndEntering',
  eligibility: "Paper discs that instantly punch a hole through anything solid, used by burglars.",
  dossier: {
    nickname: "Instant Hole",
    authors: "Unknown Author, rewritten by Aelanna",
    images: [],
  },
} satisfies ScpDefinition
