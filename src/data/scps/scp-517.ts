import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-517',
  name: 'SCP-517',
  objectClass: 'Safe',
  wave: 17,
  types: ['Temporal', 'Memetic'],
  stats: { template: 'support' },
  moves: ['grim-fortune', 'turn-back-time', 'sedative', 'lay-snare'],
  moveNames: { 'turn-back-time': 'Your Future', sedative: 'Bedtime Story', 'lay-snare': "Grammie's Game" },
  signatureMove: spec('grim-fortune', 'Grim Fortune', 'Memetic', 75, 100, [inflict('Amnesiac', 30)]),
  ability: 'grammieKnows',
  eligibility: "A fortune-telling machine whose puppet grandmother knows, and drags the curious inside.",
  dossier: {
    nickname: "Grammie Knows",
    authors: "Dexanote",
    images: [],
  },
} satisfies ScpDefinition
