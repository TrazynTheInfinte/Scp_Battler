import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-102',
  name: 'SCP-102',
  objectClass: 'Euclid',
  wave: 10,
  types: ['Antimemetic', 'Reality'],
  stats: { template: 'fastSpecial' },
  moves: ['unseen-guest', 'blink', 'obscure', 'refine'],
  moveNames: { blink: 'Phase Through', obscure: 'Vanishing Act', refine: 'Rented Reality' },
  signatureMove: spec('unseen-guest', 'Unseen Guest', 'Antimemetic', 80, null),
  ability: 'keyholder',
  eligibility: "A rented mansion that makes its paying guest invisible and intangible at will.",
  dossier: {
    nickname: "Property of Marshall, Carter, and Dark Ltd.",
    authors: "tunedtoadeadchannel, Tyrastafr and xexnoncores",
    mature: true,
    images: [],
  },
} satisfies ScpDefinition
