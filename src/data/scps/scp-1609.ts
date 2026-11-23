import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-1609',
  name: 'SCP-1609',
  objectClass: 'Euclid',
  wave: 2,
  types: ['Kinetic', 'Antimemetic'],
  stats: { template: 'fastPhysical' },
  moves: ['splinter-strike', 'blink', 'bone-saw', 'overclock'],
  signatureMove: phys('splinter-strike', 'Splinter Strike', 'Kinetic', 85, 100, [inflict('Bleeding', 20)]),
  ability: 'agitated',
  eligibility: 'A teleporting chair that drives its splinters into anyone hostile.',
  dossier: {
    nickname: 'Remnants of a Chair',
    authors: 'Rioghail',
    images: [],
  },
} satisfies ScpDefinition
