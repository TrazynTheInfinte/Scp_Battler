import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-4547',
  name: 'SCP-4547',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Mechanical', 'Temporal'],
  stats: { template: 'mixedAttacker' },
  moves: ['dead-hand', 'decay', 'corrosive-touch', 'crimson-residue'],
  moveNames: { decay: 'Fallout', 'corrosive-touch': 'Corpse Grasp', 'crimson-residue': 'Plague Bite' },
  signatureMove: spec('dead-hand', 'Dead Hand', 'Mechanical', 100, 90),
  ability: 'extinctionCascade',
  eligibility: "A dead world where a doomsday AI, a corpse plague and giants all ended its people at once.",
  dossier: {
    nickname: "Exterminans",
    authors: "stormbreath",
    images: [],
  },
} satisfies ScpDefinition
