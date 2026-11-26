import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-255',
  name: 'SCP-255',
  objectClass: 'Safe',
  wave: 12,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'fastPhysical' },
  moves: ['ad-blocker', 'relentless-pursuit', 'ambush', 'roll-out'],
  moveNames: { 'relentless-pursuit': 'Hunt the Advertiser', ambush: 'Pull a Weapon', 'roll-out': 'Cube Bounce' },
  signatureMove: phys('ad-blocker', 'Ad Blocker', 'Mechanical', 80, 100),
  ability: 'unskippable',
  eligibility: "A browser-extension mascot that pulls out weapons and goes after every advertiser it finds.",
  dossier: {
    nickname: "To Kill An Advertiser",
    authors: "xexnoncores",
    mature: true,
    images: [],
  },
} satisfies ScpDefinition
