import { status, heal, cure } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-999',
  name: 'SCP-999',
  objectClass: 'Safe',
  wave: 1,
  types: ['Biological'],
  stats: { template: 'support', tweaks: { hp: 4, atk: 6, def: -2, spa: 8, spd: -6, spe: -10 } },
  moves: ['embrace', 'tickle', 'contagious-joy', 'calming-ooze'],
  signatureMove: status('embrace', 'Embrace', 'Biological', null, [heal(33), cure]),
  ability: 'jovial',
  eligibility: 'A living, mobile entity that actively soothes and heals.',
  dossier: {
    nickname: 'The Tickle Monster',
    authors: 'ProfSnider',
    images: [],
  },
} satisfies ScpDefinition
