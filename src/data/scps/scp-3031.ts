import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-3031',
  name: 'SCP-3031',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Biological', 'Antimemetic'],
  stats: { template: 'support' },
  moves: ['fearless', 'acidic-bile', 'memory-hole', 'sedative'],
  moveNames: { 'acidic-bile': 'Glial Surge', 'memory-hole': 'Fear Forgotten', sedative: 'Steady Nerves' },
  signatureMove: spec('fearless', 'Fearless', 'Antimemetic', 80, 100),
  ability: 'fearSuppression',
  eligibility: "A brain parasite in nearly everyone that suppresses fear, shielding them from a deadly meme.",
  dossier: {
    nickname: "Future Gift",
    authors: "Weryllium",
    images: [],
  },
} satisfies ScpDefinition
