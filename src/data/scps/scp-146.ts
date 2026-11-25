import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-146',
  name: 'SCP-146',
  objectClass: 'Euclid',
  wave: 10,
  types: ['Memetic', 'Antimemetic'],
  stats: { template: 'support' },
  moves: ['shameful-gaze', 'corrupt-file', 'memory-hole', 'erasure'],
  moveNames: { 'corrupt-file': 'Old Regrets', 'memory-hole': 'Buried Memory', erasure: 'Catatonia' },
  signatureMove: spec('shameful-gaze', 'Shameful Gaze', 'Memetic', 80, 100, [inflict('Stunned', 30)]),
  ability: 'mountingGuilt',
  eligibility: "A bronze head whose gaze drags up every guilty memory until the viewer shuts down.",
  dossier: {
    nickname: "Bronze Head of Shame",
    authors: "Skali Sharpnose",
    images: [],
  },
} satisfies ScpDefinition
