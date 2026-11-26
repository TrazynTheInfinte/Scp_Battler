import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-477',
  name: 'SCP-477',
  objectClass: 'Euclid',
  wave: 16,
  types: ['Kinetic', 'Temporal'],
  stats: { template: 'physicalBruiser' },
  moves: ['stone-swim', 'flurry', 'lay-snare', 'crushing-jaws'],
  moveNames: { flurry: 'Trilobite Swarm', 'lay-snare': 'Living Shale', 'crushing-jaws': 'Anomalocaris Bite' },
  signatureMove: phys('stone-swim', 'Stone Swim', 'Temporal', 80, 100),
  ability: 'livingRock',
  eligibility: "Precambrian fossils that swim through solid rock and snap at whatever stands on it.",
  dossier: {
    nickname: "Fossil Sea",
    authors: "SimpleCadence",
    images: [],
  },
} satisfies ScpDefinition
