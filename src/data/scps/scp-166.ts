import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-166',
  name: 'SCP-166',
  objectClass: 'Euclid',
  wave: 10,
  types: ['Biological', 'Temporal'],
  stats: { template: 'balanced' },
  moves: ['return-to-nature', 'acidic-bile', 'calming-ooze', 'corrosive-touch'],
  moveNames: { 'acidic-bile': 'Thorn Volley', 'calming-ooze': 'Gentle Bloom', 'corrosive-touch': 'Rust to Ore' },
  signatureMove: spec('return-to-nature', 'Return to Nature', 'Temporal', 85, 100, [foe({ def: -1 }, 30)]),
  ability: 'gaeasField',
  eligibility: "A teenage girl with reindeer features who makes artificial things decay and plants sprout around her.",
  dossier: {
    nickname: "Just a Teenage Gaea",
    authors: "Ross Fisher-Davis, Cerastes and DrClef",
    images: [],
  },
} satisfies ScpDefinition
