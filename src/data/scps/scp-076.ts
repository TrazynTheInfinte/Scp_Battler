import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-076',
  name: 'SCP-076',
  objectClass: 'Keter',
  wave: 2,
  types: ['Kinetic'],
  stats: { template: 'fastPhysical' },
  moves: ['rift-blade', 'rend', 'ambush', 'stalk'],
  moveNames: { rend: 'Cleave', stalk: 'Battle Lust' },
  signatureMove: phys('rift-blade', 'Rift Blade', 'Kinetic', 80, null),
  ability: 'undying',
  eligibility: 'A superhuman warrior who hunts people with blades pulled from rifts.',
  dossier: {
    nickname: 'Able',
    authors: 'Kain Pathos Crow, rewritten by DrClef',
    images: [],
  },
} satisfies ScpDefinition
