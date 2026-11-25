import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-4005',
  name: 'SCP-4005',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Memetic', 'Thaumic'],
  stats: { template: 'support' },
  moves: ['pilgrims-light', 'smite', 'dissonant-chord', 'blinding-light'],
  moveNames: { smite: 'Holy Radiance', 'dissonant-chord': 'Call to Prayer', 'blinding-light': 'Lantern Glare' },
  signatureMove: spec('pilgrims-light', "Pilgrim's Light", 'Memetic', 80, 100, [inflict('Amnesiac', 30)]),
  ability: 'callToPilgrimage',
  eligibility: "An unbreakable glass lamp whose light shows a holy city; whoever stares into it walks away to find it.",
  dossier: {
    nickname: "The Holy and Heavenly City of Fabled China",
    authors: "Tufto",
    images: [],
  },
} satisfies ScpDefinition
