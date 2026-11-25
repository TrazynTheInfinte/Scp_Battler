import { phys, self } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-2023-ex',
  name: 'SCP-2023-EX',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Mundane'],
  stats: { template: 'fastPhysical' },
  moves: ['kinetoglyph', 'quick-jab', 'strike', 'brace'],
  moveNames: { 'quick-jab': 'Sprint Start', strike: 'Body Check', brace: 'Team Huddle' },
  signatureMove: phys('kinetoglyph', 'Kinetoglyph', 'Mundane', 85, 100, [self({ spe: 1 })]),
  ability: 'deflection',
  eligibility: "Two gymnasts whose routines stopped gunfire and took down a Mobile Task Force team.",
  dossier: {
    nickname: "Capable Athletes",
    authors: "Ethagon and Silentwatcher",
    images: [],
  },
} satisfies ScpDefinition
