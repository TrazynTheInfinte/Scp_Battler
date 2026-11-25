import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-4891',
  name: 'SCP-4891',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Biological', 'Memetic'],
  stats: { template: 'fastSpecial' },
  moves: ['phantom-swarm', 'acidic-bile', 'corrupt-file', 'sedative'],
  moveNames: { 'acidic-bile': 'Burrowing Larvae', 'corrupt-file': 'Phantom Itch', sedative: 'Crawling Dread' },
  signatureMove: spec('phantom-swarm', 'Phantom Swarm', 'Memetic', 80, 100, [inflict('Bleeding', 30)]),
  ability: 'knowingIsEnough',
  eligibility: "Coffin flies whose victims feel every touch as another fly landing on them, until it kills them.",
  dossier: {
    nickname: "A Great Pestilence",
    authors: "Penton",
    images: [],
  },
} satisfies ScpDefinition
