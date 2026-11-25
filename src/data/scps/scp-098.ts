import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-098',
  name: 'SCP-098',
  objectClass: 'Safe',
  wave: 5,
  types: ['Kinetic', 'Memetic'],
  stats: { template: 'fastPhysical' },
  moves: ['tendon-cut', 'crimson-residue', 'flank', 'stalk'],
  moveNames: { 'crimson-residue': 'Precise Incision', flank: 'Scuttle', stalk: 'Swarm Gathers' },
  signatureMove: phys('tendon-cut', 'Tendon Cut', 'Kinetic', 80, 100, [foe({ spe: -1 }, 30)]),
  ability: 'packHunter',
  eligibility: "Pack-hunting crustaceans that mimic prey sounds, cut tendons with silica-edged claws, and spit hardening mucus.",
  dossier: {
    nickname: "Surgeon Crabs",
    authors: "DrEverettMann",
    images: [],
  },
} satisfies ScpDefinition
