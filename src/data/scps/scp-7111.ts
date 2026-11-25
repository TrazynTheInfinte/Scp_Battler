import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-7111',
  name: 'SCP-7111',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Temporal', 'Thaumic'],
  stats: { template: 'balanced' },
  moves: ['coin-toss', 'turn-back-time', 'flank', 'blinding-light'],
  moveNames: { 'turn-back-time': 'Double or Nothing', flank: 'Lucky Break', 'blinding-light': 'Heads or Tails' },
  signatureMove: spec('coin-toss', 'Coin Toss', 'Thaumic', 130, 60),
  ability: 'oddsEnforcer',
  eligibility: "A reality-bender who lost a coin-flip game against a chance-enforcing entity and now warns other worlds.",
  dossier: {
    nickname: "A World of Chance",
    authors: "ClownSlayer",
    images: [],
  },
} satisfies ScpDefinition
