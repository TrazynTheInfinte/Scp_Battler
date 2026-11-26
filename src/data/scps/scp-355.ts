import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-355',
  name: 'SCP-355',
  objectClass: 'Euclid',
  wave: 14,
  types: ['Biological', 'Mechanical'],
  stats: { template: 'wall' },
  moves: ['razor-blades', 'rend', 'corrosive-touch', 'coarse'],
  moveNames: { rend: 'Serrated Edge', 'corrosive-touch': 'Deep Roots', coarse: 'Fullerene Core' },
  signatureMove: phys('razor-blades', 'Razor Blades', 'Biological', 75, 100, [inflict('Bleeding', 30)]),
  ability: 'barefootPeril',
  eligibility: "Grass with blades hard and sharp enough to pierce wood, grown as a weapon.",
  dossier: {
    nickname: "The Serrated Lawn",
    authors: "Noaqiyeum",
    images: [],
  },
} satisfies ScpDefinition
