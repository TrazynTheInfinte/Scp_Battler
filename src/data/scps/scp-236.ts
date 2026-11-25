import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-236',
  name: 'SCP-236',
  objectClass: 'Keter',
  wave: 10,
  types: ['Biological', 'Antimemetic'],
  stats: { template: 'fastPhysical' },
  moves: ['swarm-consume', 'blink', 'crimson-residue', 'stalk'],
  moveNames: { blink: 'Mimic Ambush', 'crimson-residue': 'Consume From Within', stalk: 'Replicate' },
  signatureMove: phys('swarm-consume', 'Swarm Consume', 'Biological', 85, 100, [inflict('Bleeding', 30)]),
  ability: 'hiveDetonation',
  eligibility: "A hive-mind swarm of microscopic crabs that mimics objects, replicates from flesh and self-destructs when cornered.",
  dossier: {
    nickname: "Mimic \"Crabs\"",
    authors: "Dr Gears",
    images: [],
  },
} satisfies ScpDefinition
