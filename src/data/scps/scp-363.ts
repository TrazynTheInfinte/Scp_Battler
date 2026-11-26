import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-363',
  name: 'SCP-363',
  objectClass: 'Keter',
  wave: 14,
  types: ['Biological', 'Antimemetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['grow-in-the-dark', 'crushing-jaws', 'rend', 'ambush'],
  moveNames: { 'crushing-jaws': 'Elongated Mandibles', rend: 'Tentacle Lash', ambush: 'Lurk in the Dark' },
  signatureMove: phys('grow-in-the-dark', 'Grow in the Dark', 'Biological', 85, 100),
  ability: 'darkGrowth',
  eligibility: "Giant centipedes that, in darkness, swell into ten-metre masses of tentacles and mandibles.",
  dossier: {
    nickname: "Not Centipedes",
    authors: "Josef Kald",
    images: [],
  },
} satisfies ScpDefinition
