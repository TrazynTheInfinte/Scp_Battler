import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-017',
  name: 'SCP-017',
  objectClass: 'Keter',
  wave: 3,
  types: ['Antimemetic', 'Reality'],
  stats: { template: 'fastSpecial' },
  moves: ['engulf', 'negative-space', 'refine', 'erasure'],
  signatureMove: spec('engulf', 'Engulf', 'Antimemetic', 80, 100),
  ability: 'shroud',
  eligibility: "A smoke-like shadow figure that leaps on anything casting a shadow and absorbs it without a trace.",
  dossier: {
    nickname: 'Shadow Person',
    authors: 'CityToast',
    images: [],
  },
} satisfies ScpDefinition
