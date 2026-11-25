import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-8002',
  name: 'SCP-8002',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Biological', 'Temporal'],
  stats: { template: 'support' },
  moves: ['cleric-flame', 'decay', 'smite', 'calming-ooze'],
  moveNames: { decay: 'Ember Rain', smite: 'Phoenix Cry', 'calming-ooze': 'Soothing Warmth' },
  signatureMove: spec('cleric-flame', 'Cleric Flame', 'Biological', 80, 100),
  ability: 'clericRadiation',
  eligibility: "A flaming bird whose radiation heals any wound, kept at the heart of the Foundation's main hospital.",
  dossier: {
    nickname: "Maslov's Fire",
    authors: "bigslothonmyface",
    images: [],
  },
} satisfies ScpDefinition
