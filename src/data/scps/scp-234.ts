import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-234',
  name: 'SCP-234',
  objectClass: 'Euclid',
  wave: 10,
  types: ['Antimemetic', 'Kinetic'],
  stats: { template: 'fastSpecial' },
  moves: ['implosion', 'blink', 'memory-hole', 'obscure'],
  moveNames: { blink: 'Dart Away', 'memory-hole': 'Other Dimension', obscure: 'School Flicker' },
  signatureMove: spec('implosion', 'Implosion', 'Kinetic', 90, 100),
  ability: 'startled',
  eligibility: "Tiny extradimensional fish that live in closed spaces and implode their surroundings when startled.",
  dossier: {
    nickname: "Extradimensional Fish",
    authors: "Aelanna",
    images: [],
  },
} satisfies ScpDefinition
