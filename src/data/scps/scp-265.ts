import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-265',
  name: 'SCP-265',
  objectClass: 'Euclid',
  wave: 12,
  types: ['Mechanical', 'Antimemetic'],
  stats: { template: 'fastPhysical' },
  moves: ['abduction', 'ram', 'blink', 'roll-out'],
  moveNames: { ram: 'Run Down', blink: 'Vanish', 'roll-out': 'Silent Approach' },
  signatureMove: phys('abduction', 'Abduction', 'Antimemetic', 80, 100, [inflict('Contained', 30)]),
  ability: 'curtainedWindows',
  eligibility: "A driverless black Volga that appears out of nowhere and takes people away.",
  dossier: {
    nickname: "Black Volga",
    authors: "judgedeadd and Dexanote",
    images: [],
  },
} satisfies ScpDefinition
