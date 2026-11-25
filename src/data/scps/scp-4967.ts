import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-4967',
  name: 'SCP-4967',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Thaumic', 'Memetic'],
  stats: { template: 'support' },
  moves: ['holy-water', 'dissonant-chord', 'refine', 'calming-ooze'],
  moveNames: { 'dissonant-chord': 'Hunka Hymn', refine: 'Baptize', 'calming-ooze': 'Blessed Croon' },
  signatureMove: spec('holy-water', 'Holy Water', 'Thaumic', 80, 100),
  ability: 'sanctified',
  eligibility: "A sainted Elvis impersonator who turns a reservoir into holy water for fighting demons.",
  dossier: {
    nickname: "Thaumielvis",
    authors: "Uncle Nicolini",
    images: [],
  },
} satisfies ScpDefinition
