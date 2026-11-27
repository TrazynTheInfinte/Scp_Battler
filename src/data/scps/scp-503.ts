import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-503',
  name: 'SCP-503',
  objectClass: 'Euclid',
  wave: 17,
  types: ['Reality', 'Temporal'],
  stats: { template: 'balanced' },
  moves: ['dumb-luck', 'quick-strike', 'turn-back-time', 'blink'],
  moveNames: { 'quick-strike': 'Right Place, Right Time', 'turn-back-time': 'Close Call', blink: 'Narrow Escape' },
  signatureMove: phys('dumb-luck', 'Dumb Luck', 'Reality', 80, 100),
  ability: 'shortTermLuck',
  eligibility: "A man with impossible good luck now and terrible luck later, deadly to anyone in the way.",
  dossier: {
    nickname: "The Luckiest Man in the World",
    authors: "DStecks",
    images: [],
  },
} satisfies ScpDefinition
