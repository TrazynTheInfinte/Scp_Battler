import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-056',
  name: 'SCP-056',
  objectClass: 'Euclid',
  wave: 4,
  types: ['Memetic', 'Reality'],
  stats: { template: 'support' },
  moves: ['captivate', 'calming-ooze', 'corrupt-file', 'regenerate'],
  moveNames: { 'calming-ooze': 'Disarming Beauty', 'corrupt-file': 'Unsettling Charm', regenerate: 'Flawless Renewal' },
  signatureMove: spec('captivate', 'Captivate', 'Memetic', 70, 100, [inflict('Stunned', 20)]),
  ability: 'fascination',
  eligibility: "Becomes whatever its onlookers find most disarming; one incident left 27 people dead.",
  dossier: {
    nickname: "A Beautiful Person",
    authors: "Unknown Author",
    images: [],
  },
} satisfies ScpDefinition
