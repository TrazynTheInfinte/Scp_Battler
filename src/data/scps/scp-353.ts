import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-353',
  name: 'SCP-353',
  objectClass: 'Keter',
  wave: 14,
  types: ['Biological', 'Reality'],
  stats: { template: 'specialBruiser' },
  moves: ['pandemic', 'acidic-bile', 'decay', 'refine'],
  moveNames: { 'acidic-bile': 'Fever', decay: 'Wasting', refine: 'Mood Swing' },
  signatureMove: spec('pandemic', 'Pandemic', 'Biological', 85, 100, [inflict('Bleeding', 30)]),
  ability: 'outbreak',
  eligibility: "A woman who gathers diseases inside herself and releases them as pandemics when her mood flares.",
  dossier: {
    nickname: "\"Vector\"",
    authors: "Ross Fisher-Davis and Pair Of Ducks",
    images: [],
  },
} satisfies ScpDefinition
