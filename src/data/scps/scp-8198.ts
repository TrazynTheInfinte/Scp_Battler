import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-8198',
  name: 'SCP-8198',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Memetic', 'Antimemetic'],
  stats: { template: 'support' },
  moves: ['endless-nightmare', 'sedative', 'memory-hole', 'negative-space'],
  signatureMove: spec('endless-nightmare', 'Endless Nightmare', 'Memetic', 80, 100, [inflict('Stunned', 30)]),
  ability: 'deathOfSleep',
  eligibility: "A living plane of nightmares: anyone who falls asleep is trapped there and never wakes.",
  dossier: {
    nickname: "The Death of Sleep",
    authors: "DrAlexeiKnight",
    images: [],
  },
} satisfies ScpDefinition
