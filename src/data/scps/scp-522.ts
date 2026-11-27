import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-522',
  name: 'SCP-522',
  objectClass: 'Safe',
  wave: 17,
  types: ['Biological', 'Antimemetic'],
  stats: { template: 'wall' },
  moves: ['wrap-and-drain', 'crimson-residue', 'blink', 'lay-snare'],
  moveNames: { 'crimson-residue': 'Bloodstain', blink: 'Lie Flat', 'lay-snare': 'Lie in Wait' },
  signatureMove: { ...phys('wrap-and-drain', 'Wrap and Drain', 'Biological', 75, 100), drain: 0.5 },
  ability: 'wallToWall',
  eligibility: "A red carpet that rolls up around whoever steps on it and drains their blood.",
  dossier: {
    nickname: "Blood-draining Carpet",
    authors: "Felgraf",
    images: [],
  },
} satisfies ScpDefinition
