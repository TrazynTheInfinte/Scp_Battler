import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-9746',
  name: 'SCP-9746',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Antimemetic', 'Mechanical'],
  stats: { template: 'fastSpecial' },
  moves: ['concept-devour', 'data-surge', 'negative-space', 'obscure'],
  signatureMove: spec('concept-devour', 'Concept Devour', 'Antimemetic', 85, 100),
  ability: 'conceptEater',
  eligibility: "A digitized horse loose on the web, eating files, decisions and ideas out of existence.",
  dossier: {
    nickname: "Digital Horse Methods",
    authors: "Zozigazagazongo",
    images: [],
  },
} satisfies ScpDefinition
