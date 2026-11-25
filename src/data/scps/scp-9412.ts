import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-9412',
  name: 'SCP-9412',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Memetic', 'Antimemetic'],
  stats: { template: 'fastSpecial' },
  moves: ['moral-panic', 'erasure', 'memory-hole', 'corrupt-file'],
  signatureMove: spec('moral-panic', 'Moral Panic', 'Memetic', 85, 100, [foe({ spd: -1 }, 30)]),
  ability: 'mobMentality',
  eligibility: "A memetic plague that warps memory and morals, turning the infected against anyone who eats a certain food.",
  dossier: {
    nickname: "PROJECT G.C.",
    authors: "AltaLego",
    images: [],
  },
} satisfies ScpDefinition
