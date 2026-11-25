import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-7264',
  name: 'SCP-7264',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Temporal', 'Thaumic'],
  stats: { template: 'support' },
  moves: ['curtain-call', 'smite', 'dissonant-chord', 'blood-ink'],
  moveNames: { smite: 'Divine Applause', 'dissonant-chord': 'Overture', 'blood-ink': 'Red Fluid' },
  signatureMove: spec('curtain-call', 'Curtain Call', 'Temporal', 80, 100, [inflict('Stunned', 30)]),
  ability: 'frozenAudience',
  eligibility: "A theatre outside reality whose frozen audience of entities wakes as a red fluid sets time running.",
  dossier: {
    nickname: "Theatre of Divinity",
    authors: "LightlessLantern",
    images: [],
  },
} satisfies ScpDefinition
