import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-066',
  name: 'SCP-066',
  objectClass: 'Euclid',
  wave: 4,
  types: ['Memetic', 'Mechanical'],
  stats: { template: 'fastSpecial' },
  moves: ['deafening-blast', 'dissonant-chord', 'gear-grind', 'overclock'],
  moveNames: { 'gear-grind': 'Coiled Lash', overclock: 'Rewind' },
  signatureMove: spec('deafening-blast', 'Deafening Blast', 'Memetic', 75, 100, [inflict('Stunned', 20)]),
  ability: 'constantRefrain',
  eligibility: "A mass of yarn whose sounds have permanently deafened staff, and which lashes out with fast strands.",
  dossier: {
    nickname: "Eric's Toy",
    authors: "Unknown Author, rewritten by Akumeoy",
    images: [],
  },
} satisfies ScpDefinition
