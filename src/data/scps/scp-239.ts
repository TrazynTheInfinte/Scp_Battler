import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-239',
  name: 'SCP-239',
  objectClass: 'Keter',
  wave: 10,
  types: ['Reality', 'Thaumic'],
  stats: { template: 'specialBruiser' },
  moves: ['i-want-it', 'smite', 'dissonant-chord', 'turn-back-time'],
  moveNames: { smite: "Witch's Hex", 'dissonant-chord': 'Temper Tantrum', 'turn-back-time': 'Undo It' },
  signatureMove: spec('i-want-it', 'I Want It', 'Reality', 95, 100),
  ability: 'whateverSheWants',
  eligibility: "A child reality-bender who can do anything she truly wants while awake, so she is kept asleep.",
  dossier: {
    nickname: "The Witch Child",
    authors: "Dantensen",
    images: [],
  },
} satisfies ScpDefinition
