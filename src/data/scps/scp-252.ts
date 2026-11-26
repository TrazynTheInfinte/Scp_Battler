import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-252',
  name: 'SCP-252',
  objectClass: 'Safe',
  wave: 12,
  types: ['Memetic', 'Reality'],
  stats: { template: 'mixedAttacker' },
  moves: ['chromatophore-flash', 'crushing-jaws', 'unmake', 'corrupt-file'],
  moveNames: { 'crushing-jaws': 'Beak Bite', unmake: 'Monstrous Shift', 'corrupt-file': 'Hypnotic Colors' },
  signatureMove: spec('chromatophore-flash', 'Chromatophore Flash', 'Memetic', 75, 100, [inflict('Stunned', 20)]),
  ability: 'whenThreatened',
  eligibility: "Squid whose shifting colours hypnotize prey, and which turn into something huge when threatened.",
  dossier: {
    nickname: "Humboldt Squid",
    authors: "wishun",
    images: [],
  },
} satisfies ScpDefinition
