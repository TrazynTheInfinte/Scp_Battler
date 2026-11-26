import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-489',
  name: 'SCP-489',
  objectClass: 'Euclid',
  wave: 16,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['swatter-storm', 'quick-strike', 'lay-snare', 'crushing-jaws'],
  moveNames: { 'quick-strike': 'Zap', 'lay-snare': 'Roach Motel', 'crushing-jaws': 'Stomp' },
  signatureMove: { ...phys('swatter-storm', 'Swatter Storm', 'Mechanical', 25, 100), hits: [2, 5] as const },
  ability: 'bugZapper',
  eligibility: "A rolling dome of bug spray, zappers, swatters and shoes that moves as one to kill anything that crawls.",
  dossier: {
    nickname: "1-555-BUG-BASH",
    authors: "OZ Ouroboros",
    images: [],
  },
} satisfies ScpDefinition
