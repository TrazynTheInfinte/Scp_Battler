import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-9947',
  name: 'SCP-9947',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Memetic', 'Reality'],
  stats: { template: 'balanced' },
  moves: ['next-episode', 'refine', 'dissonant-chord', 'blinding-light'],
  moveNames: { refine: 'Animated Scene', 'dissonant-chord': 'Theme Song', 'blinding-light': 'Screen Glow' },
  signatureMove: spec('next-episode', 'Next Episode', 'Memetic', 85, 100, [inflict('Contained', 30)]),
  ability: 'summonedCast',
  eligibility: "A children's cartoon whose lost episodes pull viewers inside and conjure SCPs into its story.",
  dossier: {
    nickname: "The Adventures of Xiaoyu and Xiaoyan",
    authors: "TheeSamuuel",
    images: [],
  },
} satisfies ScpDefinition
