import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-504',
  name: 'SCP-504',
  objectClass: 'Safe',
  wave: 17,
  types: ['Biological', 'Kinetic'],
  stats: { template: 'fastPhysical' },
  moves: ['tomato-barrage', 'quick-strike', 'tickle', 'crushing-jaws'],
  moveNames: { 'quick-strike': 'Heckle', tickle: 'Boo Off Stage', 'crushing-jaws': 'Splatter' },
  signatureMove: { ...phys('tomato-barrage', 'Tomato Barrage', 'Biological', 25, 100), hits: [2, 5] as const },
  ability: 'toughCrowd',
  eligibility: "Tomatoes that hurl themselves at lethal speed at anyone who tells a bad joke.",
  dossier: {
    nickname: "Critical Tomatoes",
    authors: "BlastYoBoots",
    images: [],
  },
} satisfies ScpDefinition
