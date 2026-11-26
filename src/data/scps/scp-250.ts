import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-250',
  name: 'SCP-250',
  objectClass: 'Euclid',
  wave: 12,
  types: ['Kinetic', 'Temporal'],
  stats: { template: 'physicalBruiser' },
  moves: ['jurassic-hunt', 'crushing-jaws', 'rend', 'ram'],
  moveNames: { 'crushing-jaws': 'Fossil Jaws', rend: 'Raking Claws', ram: 'Tail Sweep' },
  signatureMove: phys('jurassic-hunt', 'Jurassic Hunt', 'Temporal', 90, 100),
  ability: 'bareBones',
  eligibility: "An animated allosaur skeleton that still hunts and devours anything it sees as prey.",
  dossier: {
    nickname: "Most of an Allosaurus",
    authors: "Dr Kondraki and Voct",
    images: [],
  },
} satisfies ScpDefinition
