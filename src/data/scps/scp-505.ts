import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-505',
  name: 'SCP-505',
  objectClass: 'Keter',
  wave: 17,
  types: ['Memetic', 'Thaumic'],
  stats: { template: 'specialBruiser' },
  moves: ['spreading-ink', 'blood-ink', 'corrupt-file', 'lay-snare'],
  moveNames: { 'blood-ink': 'Ink Blot', 'corrupt-file': 'Overflow', 'lay-snare': 'Pooling Ink' },
  signatureMove: spec('spreading-ink', 'Spreading Ink', 'Memetic', 85, 100),
  ability: 'inkSpreads',
  eligibility: "Black ink from a fountain pen that copies itself, spreading and staining everything it reaches.",
  dossier: {
    nickname: "Ink Stain",
    authors: "ModernMajorGeneral",
    images: [],
  },
} satisfies ScpDefinition
