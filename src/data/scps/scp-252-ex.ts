import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-252-ex',
  name: 'SCP-252-EX',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Mundane'],
  stats: { template: 'slowSpecial' },
  moves: ['detonation', 'blast', 'flare', 'brace'],
  signatureMove: spec('detonation', 'Detonation', 'Mundane', 100, 85),
  ability: 'shrapnel',
  eligibility: "A Mark 65 aerial bomb that turned out to be exactly that: a completely normal bomb.",
  dossier: {
    nickname: "A Completely Normal Bomb",
    authors: "ObserverSeptember",
    images: [],
  },
} satisfies ScpDefinition
