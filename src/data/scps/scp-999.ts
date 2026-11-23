import { status, heal, cure } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-999',
  name: 'SCP-999',
  objectClass: 'Safe',
  wave: 1,
  types: ['Biological'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 110, atk: 60, def: 80, spa: 70, spd: 90, spe: 40 } },
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
