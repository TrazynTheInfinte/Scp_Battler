import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-058',
  name: 'SCP-058',
  objectClass: 'Keter',
  wave: 4,
  types: ['Biological', 'Kinetic'],
  stats: { template: 'fastPhysical', tweaks: { atk: -10, spa: 10 } },
  moves: ['tentacle-lash', 'crimson-residue', 'blink', 'stalk'],
  signatureMove: phys('tentacle-lash', 'Tentacle Lash', 'Kinetic', 80, 100),
  ability: 'resilient',
  eligibility: "A heart on four legs that lashes out with spiked tentacles and a burning stinger, and shrugs off trauma.",
  dossier: {
    nickname: "Heart of Darkness",
    authors: "Unknown Author",
    images: [],
  },
} satisfies ScpDefinition
