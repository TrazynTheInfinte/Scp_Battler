import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'op-ls',
  name: 'L.S.',
  objectClass: 'Keter',
  wave: 3,
  types: ['Thaumic', 'Antimemetic'],
  stats: { template: 'fastSpecial' },
  moves: ['hands-hex', 'memory-hole', 'turn-back-time', 'erasure'],
  signatureMove: spec('hands-hex', "Hand's Hex", 'Thaumic', 85, 100, [foe({ spa: -1 }, 20)]),
  ability: 'wayWalker',
  eligibility: "A Serpent's Hand leader who walked into Site-19 unnoticed to steal anomalies.",
  dossier: {
    nickname: "\"Little Sister\"",
    authors: 'Pair Of Ducks',
    wikiUrl: 'https://scp-wiki.wikidot.com/incident-report-x23',
    images: [],
  },
} satisfies ScpDefinition
