import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-1933-ex',
  name: 'SCP-1933-EX',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Mundane'],
  stats: { template: 'physicalBruiser' },
  moves: ['animatronic-lunge', 'bludgeon', 'pepper-spray', 'brace'],
  signatureMove: phys('animatronic-lunge', 'Animatronic Lunge', 'Mundane', 90, 95),
  ability: 'smokeAndMirrors',
  eligibility: "A lake serpent that was always a hoax: the footage was a staged animatronic.",
  dossier: {
    nickname: "Lake ███████ Monster",
    authors: "RecursiveRecursion",
    images: [],
  },
} satisfies ScpDefinition
