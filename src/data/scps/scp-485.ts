import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-485',
  name: 'SCP-485',
  objectClass: 'Safe',
  wave: 16,
  types: ['Antimemetic', 'Memetic'],
  stats: { template: 'support' },
  moves: ['click', 'corrupt-file', 'erasure', 'memory-hole'],
  moveNames: { 'corrupt-file': 'Fine Print', erasure: 'Policy Lapse', 'memory-hole': 'No Record' },
  signatureMove: { ...spec('click', 'Click', 'Antimemetic', 60, 100), priority: 1 },
  ability: 'tickingClock',
  eligibility: "A ballpoint pen: every click of the button, someone the user knows dies.",
  dossier: {
    nickname: "Death Pen",
    authors: "NerfJihad",
    images: [],
  },
} satisfies ScpDefinition
