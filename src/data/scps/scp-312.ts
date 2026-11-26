import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-312',
  name: 'SCP-312',
  objectClass: 'Euclid',
  wave: 13,
  types: ['Biological', 'Reality'],
  stats: { template: 'fastSpecial' },
  moves: ['stinging-tendrils', 'obscure', 'refine', 'acidic-bile'],
  moveNames: { obscure: 'Cloud Cover', refine: 'Updraft', 'acidic-bile': 'Digest' },
  signatureMove: spec('stinging-tendrils', 'Stinging Tendrils', 'Biological', 80, 100, [inflict('Stunned', 20)]),
  ability: 'highAbove',
  eligibility: "A sky-borne jellyfish that hides in a cloud of its own making and drops its tendrils on prey.",
  dossier: {
    nickname: "Atmospheric Jellyfish",
    authors: "GwenWinterheart",
    images: [],
  },
} satisfies ScpDefinition
