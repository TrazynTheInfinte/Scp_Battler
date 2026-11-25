import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-070',
  name: 'SCP-070',
  objectClass: 'Safe',
  wave: 4,
  types: ['Mechanical', 'Biological'],
  stats: { template: 'wall' },
  moves: ['chain-lash', 'crimson-residue', 'rend', 'regenerate'],
  moveNames: { 'crimson-residue': 'Barbed Hooks', rend: 'Iron Wing Strike', regenerate: 'Mending Flesh' },
  signatureMove: phys('chain-lash', 'Chain Lash', 'Mechanical', 75, 100, [foe({ spe: -1 }, 30)]),
  ability: 'barbedChains',
  eligibility: "A man whose iron wings whip barbed chains at anyone who attacks him, whether he wants them to or not.",
  dossier: {
    nickname: "Iron Wings",
    authors: "Le Blue Dude",
    images: [],
  },
} satisfies ScpDefinition
