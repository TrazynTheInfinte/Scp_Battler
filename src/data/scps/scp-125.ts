import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-125',
  name: 'SCP-125',
  objectClass: 'Euclid',
  wave: 5,
  types: ['Reality', 'Antimemetic'],
  stats: { template: 'fastSpecial' },
  moves: ['reflection-leap', 'memory-hole', 'negative-space', 'overclock'],
  moveNames: { 'memory-hole': 'Mirror Trap', 'negative-space': 'Inverted Image', overclock: 'Spreading Reflection' },
  signatureMove: spec('reflection-leap', 'Reflection Leap', 'Reality', 85, 100, [foe({ spa: -1 }, 30)]),
  ability: 'blindingContagion',
  eligibility: "A being that lives in reflections, leaps into the eye, multiplies, and blinds its host.",
  dossier: {
    nickname: "Contagious Reflection",
    authors: "Agent Circeus",
    images: [],
  },
} satisfies ScpDefinition
