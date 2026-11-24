import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-111',
  name: 'SCP-111',
  objectClass: 'Safe',
  wave: 5,
  types: ['Biological', 'Mechanical'],
  stats: { template: 'specialBruiser' },
  moves: ['methane-jet', 'acidic-bile', 'calming-ooze', 'coarse'],
  signatureMove: spec('methane-jet', 'Methane Jet', 'Mechanical', 85, 100, [inflict('Bleeding', 20)]),
  ability: 'stressed',
  eligibility: "Snail-like creatures that breathe jets of burning methane when stressed or angry.",
  dossier: {
    nickname: "Dragon-Snails™",
    authors: "Adam Henderson",
    images: [],
  },
} satisfies ScpDefinition
