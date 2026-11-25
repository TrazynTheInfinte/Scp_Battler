import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-9001',
  name: 'SCP-9001',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Memetic', 'Reality'],
  stats: { template: 'fastSpecial' },
  moves: ['fractal-kill-agent', 'refine', 'corrupt-file', 'erasure'],
  moveNames: { refine: 'Recursive Pattern', 'corrupt-file': 'Subliminal Fractal', erasure: 'Cognitive Lock' },
  signatureMove: spec('fractal-kill-agent', 'Fractal Kill Agent', 'Memetic', 90, 100, [inflict('Stunned', 20)]),
  ability: 'firstOrder',
  eligibility: "A fractal set whose images range from subliminal to lethal, used to drop even reality benders.",
  dossier: {
    nickname: "Fractal",
    authors: "Croquembouche, PandoraNuker and S D Locke",
    images: [],
  },
} satisfies ScpDefinition
