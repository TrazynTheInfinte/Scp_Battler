import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-1057',
  name: 'SCP-1057',
  objectClass: 'Safe',
  wave: 2,
  types: ['Antimemetic', 'Biological'],
  stats: { template: 'fastPhysical' },
  moves: ['phantom-bite', 'crimson-residue', 'crushing-jaws', 'stalk'],
  signatureMove: phys('phantom-bite', 'Phantom Bite', 'Antimemetic', 70, null),
  ability: 'provoked',
  eligibility: 'An invisible predator that attacks swimmers and lashes out when provoked.',
  dossier: {
    nickname: 'Absence of Shark',
    authors: 'SiriExMachina and Voct',
    images: [],
  },
} satisfies ScpDefinition
