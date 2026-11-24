import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-088',
  name: 'SCP-088',
  objectClass: 'Safe',
  wave: 4,
  types: ['Biological', 'Thaumic'],
  stats: { template: 'specialBruiser' },
  moves: ['royal-mutagen', 'acidic-bile', 'smite', 'regenerate'],
  signatureMove: spec('royal-mutagen', 'Royal Mutagen', 'Thaumic', 70, 100, [inflict('Amnesiac', 20)]),
  ability: 'hibernation',
  eligibility: "An ancient reptilian king whose caustic fluid and mutagen turn those it touches into its servants.",
  dossier: {
    nickname: "The Lizard King",
    authors: "Sorts",
    images: [],
  },
} satisfies ScpDefinition
