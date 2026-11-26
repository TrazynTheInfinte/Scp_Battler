import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-486',
  name: 'SCP-486',
  objectClass: 'Safe',
  wave: 16,
  types: ['Biological', 'Temporal'],
  stats: { template: 'fastPhysical' },
  moves: ['serpent-fangs', 'leech', 'quick-strike', 'stalk'],
  moveNames: { leech: 'Venom Sip', 'quick-strike': 'Strike Like a Snake', stalk: 'Coil' },
  signatureMove: phys('serpent-fangs', 'Serpent Fangs', 'Biological', 80, 100, [inflict('Bleeding', 30)]),
  ability: 'stressShift',
  eligibility: "A woman who becomes a giant venomous snake when she is frightened or angered.",
  dossier: {
    nickname: "Coatlicue Skin",
    authors: "Yubi Shines",
    images: [],
  },
} satisfies ScpDefinition
