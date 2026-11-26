import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-273',
  name: 'SCP-273',
  objectClass: 'Euclid',
  wave: 12,
  types: ['Thaumic', 'Temporal'],
  stats: { template: 'specialBruiser' },
  moves: ['remote-combustion', 'decay', 'smite', 'turn-back-time'],
  moveNames: { decay: 'Ash to Ash', smite: 'The Hunger', 'turn-back-time': 'Slow Oxidation' },
  signatureMove: spec('remote-combustion', 'Remote Combustion', 'Thaumic', 95, 90),
  ability: 'theHunger',
  eligibility: "A woman whose hunger burns living things to ash from a distance, without any flame.",
  dossier: {
    nickname: "Human Phoenix",
    authors: "G Fox",
    images: [],
  },
} satisfies ScpDefinition
