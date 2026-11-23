import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-023',
  name: 'SCP-023',
  objectClass: 'Euclid',
  wave: 3,
  types: ['Temporal', 'Memetic'],
  stats: { template: 'fastSpecial' },
  moves: ['ashen-stare', 'decay', 'smite', 'crescendo'],
  signatureMove: spec('ashen-stare', 'Ashen Stare', 'Memetic', 80, 100, [inflict('Contained', 20)]),
  ability: 'deathOmen',
  eligibility: "A black dog whose gaze dooms whoever meets it, and which burns through anything it passes.",
  dossier: {
    nickname: 'Black Shuck',
    authors: 'Pig_catapult',
    images: [],
  },
} satisfies ScpDefinition
