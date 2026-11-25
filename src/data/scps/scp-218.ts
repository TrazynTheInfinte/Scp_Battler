import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-218',
  name: 'SCP-218',
  objectClass: 'Euclid',
  wave: 7,
  types: ['Biological'],
  stats: { template: 'physicalBruiser' },
  moves: ['lamprey-swarm', 'crushing-jaws', 'sedative', 'stalk'],
  moveNames: { 'crushing-jaws': 'Lamprey Bite', sedative: 'Numbing Slime', stalk: 'Writhing Mass' },
  signatureMove: phys('lamprey-swarm', 'Lamprey Swarm', 'Biological', 90, 100, [inflict('Stunned', 20)]),
  ability: 'paralyticMucus',
  eligibility: "A 1,800 kg mass of lampreys whose bites and mucus paralyze prey before it burrows in.",
  dossier: {
    nickname: "Lamprey-Mass Organism",
    authors: "Dr Gears, rewritten by Djoric",
    images: [],
  },
} satisfies ScpDefinition
