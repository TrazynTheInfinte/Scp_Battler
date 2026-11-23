import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-035',
  name: 'SCP-035',
  objectClass: 'Keter',
  wave: 2,
  types: ['Memetic', 'Thaumic'],
  stats: { template: 'balanced' },
  moves: ['possess', 'blood-ink', 'acidic-bile', 'calming-ooze'],
  signatureMove: spec('possess', 'Possess', 'Memetic', 85, 90),
  ability: 'psychoticAura',
  eligibility: 'A corrosive, telepathic mask that possesses whoever wears it.',
  dossier: {
    nickname: 'Possessive Mask',
    authors: 'Kain Pathos Crow',
    images: [
      { file: 'scp--035--002-new.gif', author: 'VolgunStrife', license: 'CC BY-SA 3.0' },
    ],
    art: 'scp--035--002-new.gif',
  },
} satisfies ScpDefinition
