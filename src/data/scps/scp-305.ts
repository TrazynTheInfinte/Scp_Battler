import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-305',
  name: 'SCP-305',
  objectClass: 'Euclid',
  wave: 13,
  types: ['Memetic', 'Thaumic'],
  stats: { template: 'support' },
  moves: ['whispers', 'smite', 'sedative', 'corrupt-file'],
  moveNames: { smite: 'Cracked Lips', sedative: 'Compel', 'corrupt-file': 'Echoing Voices' },
  signatureMove: spec('whispers', 'Whispers', 'Memetic', 75, 100, [inflict('Amnesiac', 30)]),
  ability: 'stoneBody',
  eligibility: "A rock formation that, when watched, walks and whispers things people feel compelled to obey.",
  dossier: {
    nickname: "The Whisperer",
    authors: "AssertiveRoland and Alias Pseudonym",
    images: [],
  },
} satisfies ScpDefinition
