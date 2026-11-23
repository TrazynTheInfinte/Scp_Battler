import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-4975',
  name: 'SCP-4975',
  objectClass: 'Euclid',
  wave: 3,
  types: ['Kinetic', 'Antimemetic'],
  stats: { template: 'fastPhysical', tweaks: { hp: 10, atk: -10 } },
  moves: ['unseen-blow', 'rend', 'roll-out', 'blink'],
  signatureMove: phys('unseen-blow', 'Unseen Blow', 'Antimemetic', 80, null),
  ability: 'unseenAssailant',
  eligibility: "Stalks its prey for months, then bludgeons and tears it apart from where it cannot be seen.",
  dossier: {
    nickname: 'The Clicking Stalker',
    authors: 'Scented_Shadow',
    images: [],
  },
} satisfies ScpDefinition
