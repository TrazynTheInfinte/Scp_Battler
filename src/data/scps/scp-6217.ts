import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6217',
  name: 'SCP-6217',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'physicalBruiser', tweaks: { atk: -15, hp: 15 } },
  moves: ['iron-contagion', 'ram', 'flank', 'roll-out'],
  moveNames: { ram: 'Iron Tide', flank: 'Gear Swarm', 'roll-out': 'Rolling Cogs' },
  signatureMove: phys('iron-contagion', 'Iron Contagion', 'Mechanical', 85, 100),
  ability: 'contagiousIron',
  eligibility: "Contagious iron that turns living things into gear-like machines that attack and spread it.",
  dossier: {
    nickname: "The Emergence",
    authors: "Re_spectators and Pedagon",
    images: [],
  },
} satisfies ScpDefinition
