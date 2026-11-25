import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-157',
  name: 'SCP-157',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Memetic'],
  stats: { template: 'balanced' },
  moves: ['anesthetic-lure', 'acidic-bile', 'corrupt-file', 'sedative'],
  moveNames: { 'acidic-bile': 'Digestive Venom', 'corrupt-file': 'False Image', sedative: 'Numbing Sting' },
  signatureMove: spec('anesthetic-lure', 'Anesthetic Lure', 'Memetic', 85, 100, [inflict('Stunned', 20)]),
  ability: 'dissolvingColony',
  eligibility: "A colony that disguises itself as food or clothing, numbs whoever touches it, and dissolves their skin.",
  dossier: {
    nickname: "Mimetic Predator",
    authors: "eric_h",
    images: [],
  },
} satisfies ScpDefinition
