import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-055',
  name: 'SCP-055',
  objectClass: 'Keter',
  types: ['Antimemetic'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 110, atk: 75, def: 110, spa: 120, spd: 110, spe: 75 } },
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
