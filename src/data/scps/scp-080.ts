import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-080',
  name: 'SCP-080',
  objectClass: 'Euclid',
  wave: 5,
  types: ['Antimemetic', 'Memetic'],
  stats: { template: 'balanced' },
  moves: ['drowsing-gaze', 'sedative', 'negative-space', 'memory-hole'],
  signatureMove: spec('drowsing-gaze', 'Drowsing Gaze', 'Antimemetic', 85, 100, [inflict('Stunned', 20)]),
  ability: 'nightmares',
  eligibility: "A shadowy shape whose gaze puts anyone watching to sleep, often leaving lasting psychological damage.",
  dossier: {
    nickname: "Dark Form",
    authors: "Ryebox",
    images: [],
  },
} satisfies ScpDefinition
