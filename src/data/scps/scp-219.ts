import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-219',
  name: 'SCP-219',
  objectClass: 'Safe',
  wave: 10,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'specialBruiser' },
  moves: ['resonance-wave', 'gear-grind', 'dissonant-chord', 'overclock'],
  moveNames: { 'gear-grind': 'Piston Drive', 'dissonant-chord': 'Harmonic Shatter', overclock: 'Tune Up' },
  signatureMove: spec('resonance-wave', 'Resonance Wave', 'Kinetic', 85, 100, [foe({ def: -1 }, 30)]),
  ability: 'tunedFrequency',
  eligibility: "A piston engine that tunes itself to a material and shatters it at range, with a missing wave-cannon focuser.",
  dossier: {
    nickname: "Resonance Engine",
    authors: "MalcolmMacLean",
    images: [],
  },
} satisfies ScpDefinition
