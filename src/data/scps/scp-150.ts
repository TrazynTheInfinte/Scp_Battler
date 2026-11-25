import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-150',
  name: 'SCP-150',
  objectClass: 'Keter',
  wave: 6,
  types: ['Biological', 'Kinetic'],
  stats: { template: 'balanced' },
  moves: ['chitin-claw', 'crimson-residue', 'weep', 'stalk'],
  moveNames: { 'crimson-residue': 'Graft Rip', weep: 'Replace Parts', stalk: 'Scavenge' },
  signatureMove: phys('chitin-claw', 'Chitin Claw', 'Kinetic', 85, 100),
  ability: 'hostTakeover',
  eligibility: "A parasite that replaces its host's limbs with stronger, faster chitinous ones, and spreads.",
  dossier: {
    nickname: "Ship of Theseus",
    authors: "The Raven, A Random Day, and Decibelles",
    images: [],
  },
} satisfies ScpDefinition
