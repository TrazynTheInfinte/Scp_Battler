import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-526',
  name: 'SCP-526',
  objectClass: 'Euclid',
  wave: 17,
  types: ['Thaumic', 'Temporal'],
  stats: { template: 'physicalBruiser' },
  moves: ['einherjar-charge', 'colossal-blow', 'rend', 'flank'],
  moveNames: { 'colossal-blow': 'Berserker Blow', rend: 'Axe Swing', flank: 'Shield Wall' },
  signatureMove: phys('einherjar-charge', 'Einherjar Charge', 'Thaumic', 85, 100),
  ability: 'warriorsReturn',
  eligibility: "A ring of rune stones on a Norwegian hill where dead warriors return to fight every sunrise.",
  dossier: {
    nickname: "Valhalla Gate",
    authors: "Aelanna",
    images: [],
  },
} satisfies ScpDefinition
