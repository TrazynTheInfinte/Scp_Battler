import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-488',
  name: 'SCP-488',
  objectClass: 'Euclid',
  wave: 16,
  types: ['Kinetic', 'Reality'],
  stats: { template: 'slowSpecial' },
  moves: ['meteor-call', 'refine', 'blinding-light', 'negative-space'],
  moveNames: { refine: 'Gravity Lure', 'blinding-light': 'Fireball Streak', 'negative-space': 'Cold Vacuum' },
  signatureMove: { ...spec('meteor-call', 'Meteor Call', 'Kinetic', 120, 100, [inflict('Irradiated', 30)]), charge: true },
  ability: 'pullOfGravity',
  eligibility: "A man whose presence pulls meteors out of a point in space and down onto wherever he is.",
  dossier: {
    nickname: "Meteor Attractor",
    authors: "Aelanna",
    images: [],
  },
} satisfies ScpDefinition
