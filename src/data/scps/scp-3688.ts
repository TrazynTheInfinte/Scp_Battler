import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-3688',
  name: 'SCP-3688',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Kinetic', 'Temporal'],
  stats: { template: 'fastPhysical' },
  moves: ['kinetoglyph-dance', 'flank', 'corrosive-touch', 'blink'],
  signatureMove: phys('kinetoglyph-dance', 'Kinetoglyph Dance', 'Kinetic', 85, 100),
  ability: 'danceOfInvincibility',
  eligibility: "A dance that makes its performer all but invincible, with variants that raise barriers and slow time.",
  dossier: {
    nickname: "You Can Dance If You Want To",
    authors: "Mortos",
    images: [],
  },
} satisfies ScpDefinition
