import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6747',
  name: 'SCP-6747',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Reality', 'Memetic'],
  stats: { template: 'fastSpecial' },
  moves: ['narrative-corruption', 'dissonant-chord', 'refine', 'corrupt-file'],
  signatureMove: spec('narrative-corruption', 'Narrative Corruption', 'Reality', 85, 100, [inflict('Amnesiac', 30)]),
  ability: 'narrativeAnchor',
  eligibility: "A story-world built to bring back the dead, haunted by a reality-warping caricature of its director.",
  dossier: {
    nickname: "CHAOS THEORY",
    authors: "Liryn, Placeholder McD, Ralliston and syuzhet",
    images: [],
  },
} satisfies ScpDefinition
