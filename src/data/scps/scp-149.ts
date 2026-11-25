import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-149',
  name: 'SCP-149',
  objectClass: 'Keter',
  wave: 6,
  types: ['Biological', 'Thaumic'],
  stats: { template: 'fastPhysical' },
  moves: ['infesting-bite', 'blink', 'bone-saw', 'stalk'],
  moveNames: { blink: 'Darting Swarm', 'bone-saw': 'Blood Drain', stalk: 'Hatching' },
  signatureMove: phys('infesting-bite', 'Infesting Bite', 'Biological', 80, 100, [inflict('Bleeding', 30)]),
  ability: 'larvalBrood',
  eligibility: "Mosquitoes whose bite turns a host's cells into eggs that hatch inside them within hours.",
  dossier: {
    nickname: "The Blood Flies",
    authors: "Arlecchino",
    images: [],
  },
} satisfies ScpDefinition
