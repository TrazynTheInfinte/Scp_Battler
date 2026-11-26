import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-448',
  name: 'SCP-448',
  objectClass: 'Safe',
  wave: 16,
  types: ['Memetic', 'Mechanical'],
  stats: { template: 'fastSpecial' },
  moves: ['pop-goes-the-weasel', 'quick-strike', 'corrupt-file', 'dissonant-chord'],
  moveNames: { 'quick-strike': 'Jack Springs Out', 'corrupt-file': 'Mood Swing', 'dissonant-chord': 'Crank Tune' },
  signatureMove: spec('pop-goes-the-weasel', 'Pop Goes the Weasel', 'Memetic', 75, 100, [inflict('Stunned', 20)]),
  ability: 'woundUp',
  eligibility: "A jack-in-the-box whose Jack leaps out shaped by the mood of whoever turns the crank.",
  dossier: {
    nickname: "Jack-in-the-Box",
    authors: "ProfSnider",
    images: [],
  },
} satisfies ScpDefinition
