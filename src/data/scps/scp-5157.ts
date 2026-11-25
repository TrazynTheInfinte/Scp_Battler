import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-5157',
  name: 'SCP-5157',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Reality', 'Temporal'],
  stats: { template: 'slowSpecial' },
  moves: ['destabilizing-pulse', 'decay', 'blinding-light', 'smite'],
  moveNames: { decay: 'Fading Starlight', 'blinding-light': 'Stellar Glow', smite: "Lovers' Quarrel" },
  signatureMove: spec('destabilizing-pulse', 'Destabilizing Pulse', 'Reality', 95, 100),
  ability: 'twoHearts',
  eligibility: "Two vast celestial lovers whose conversation sends reality-shaking pulses across the world.",
  dossier: {
    nickname: "Concerning, to say the least",
    authors: "Diordnas",
    images: [],
  },
} satisfies ScpDefinition
