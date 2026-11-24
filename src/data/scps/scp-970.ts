import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-970',
  name: 'SCP-970',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Reality', 'Antimemetic'],
  stats: { template: 'fastPhysical' },
  moves: ['forced-manifestation', 'blink', 'stalk', 'demanifest'],
  signatureMove: phys('forced-manifestation', 'Forced Manifestation', 'Reality', 85, 100),
  ability: 'randomManifestation',
  eligibility:
    "Friend's Pick: a looping set of rooms where people slip into other iterations and come back as someone else. Kit designed by a playtester around slipping in and out.",
  dossier: {
    nickname: 'The Recursive Room',
    authors: 'Freudian',
    images: [],
  },
} satisfies ScpDefinition
