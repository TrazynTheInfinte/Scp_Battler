import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-346',
  name: 'SCP-346',
  objectClass: 'Safe',
  wave: 14,
  types: ['Temporal', 'Antimemetic'],
  stats: { template: 'fastPhysical' },
  moves: ['pterodactyl-dive', 'tickle', 'flank', 'blink'],
  moveNames: { tickle: 'Nibble', flank: 'Swoop', blink: 'Flutter Away' },
  signatureMove: phys('pterodactyl-dive', 'Pterodactyl Dive', 'Temporal', 75, 100),
  ability: 'wingedDart',
  eligibility: "A bat-sized pterodactyl with a downy coat, bought in a pet shop as a \"Kongamato\".",
  dossier: {
    nickname: "\"Pterry\" the Pterodactyl",
    authors: "agatharights",
    images: [],
  },
} satisfies ScpDefinition
