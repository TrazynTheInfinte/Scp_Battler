import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-055',
  name: 'SCP-055',
  objectClass: 'Keter',
  wave: 1,
  types: ['Antimemetic'],
  stats: { template: 'specialBruiser', tweaks: { atk: 11, def: 8, spa: -8, spe: -11 } },
  moves: ['memory-hole', 'negative-space', 'erasure', 'what-isnt'],
  signatureMove: phys('what-isnt', "What Isn't", 'Reality', 80, 100),
  ability: 'selfKeepingSecret',
  eligibility: 'An active antimemetic anomaly.',
  dossier: {
    nickname: '[unknown]',
    authors: 'qntm and CptBellman',
    images: [],
  },
} satisfies ScpDefinition
