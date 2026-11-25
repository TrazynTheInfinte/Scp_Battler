import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-8274',
  name: 'SCP-8274',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Reality', 'Biological'],
  stats: { template: 'specialBruiser' },
  moves: ['dissolution', 'acidic-bile', 'turn-back-time', 'blinding-light'],
  moveNames: { 'acidic-bile': 'Dissolving Touch', 'turn-back-time': 'Chrysalis', 'blinding-light': 'Wing Flash' },
  signatureMove: spec('dissolution', 'Dissolution', 'Reality', 90, 100),
  ability: 'metamorphosis',
  eligibility: "A dormant organism in an impossible structure whose awakening would dissolve reality.",
  dossier: {
    nickname: "The Monarch Butterfly",
    authors: "iammuffin",
    mature: true,
    images: [],
  },
} satisfies ScpDefinition
