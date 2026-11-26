import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-424',
  name: 'SCP-424',
  objectClass: 'Safe',
  wave: 15,
  types: ['Memetic', 'Antimemetic'],
  stats: { template: 'fastSpecial' },
  moves: ['mimicry', 'negative-space', 'memory-hole', 'refine'],
  moveNames: { 'negative-space': 'Invisible Wall', 'memory-hole': 'Silent Act', refine: 'Reshape' },
  signatureMove: spec('mimicry', 'Mimicry', 'Memetic', 75, 100, [inflict('Amnesiac', 20)]),
  ability: 'mimeSwarm',
  eligibility: "A swarm of microscopic mimes that forms a gelatinous mass and imitates whatever it sees.",
  dossier: {
    nickname: "Nanomimes",
    authors: "A Fat Ghost",
    images: [],
  },
} satisfies ScpDefinition
