import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-172',
  name: 'SCP-172',
  objectClass: 'Euclid',
  wave: 7,
  types: ['Mechanical'],
  stats: { template: 'mixedAttacker' },
  moves: ['clockwork-fist', 'gear-grind', 'rend', 'coarse'],
  moveNames: { rend: 'Bladed Module', coarse: 'Armor Module' },
  signatureMove: phys('clockwork-fist', 'Clockwork Fist', 'Mechanical', 90, 100),
  ability: 'interchangeableModules',
  eligibility: "A clockwork man with swappable modules, including a \"soldier\" one; no lock holds it and it can copy any machine it studies.",
  dossier: {
    nickname: "The Gearman",
    authors: "Dr Gears",
    images: [],
  },
} satisfies ScpDefinition
