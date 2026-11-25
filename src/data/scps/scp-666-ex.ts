import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-666-ex',
  name: 'SCP-666-EX',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Mundane'],
  stats: { template: 'slowSpecial' },
  moves: ['criticality', 'blast', 'flare', 'brace'],
  moveNames: { blast: 'Blue Flash', flare: 'Radiation Glow', brace: 'Beryllium Shell' },
  signatureMove: spec('criticality', 'Criticality', 'Mundane', 100, 90),
  ability: 'radiation',
  eligibility: "The real plutonium core whose criticality accidents killed two scientists; the \"anomalies\" were a cover story.",
  dossier: {
    nickname: "Demon Core",
    authors: "MisterFrown",
    images: [],
  },
} satisfies ScpDefinition
