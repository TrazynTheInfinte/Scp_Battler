import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-295',
  name: 'SCP-295',
  objectClass: 'Euclid',
  wave: 13,
  types: ['Biological', 'Thaumic'],
  stats: { template: 'fastPhysical' },
  moves: ['cauterizing-bite', 'tickle', 'crimson-residue', 'stalk'],
  moveNames: { tickle: 'Swarm Crawl', 'crimson-residue': 'Burning Slime', stalk: 'Feeding Frenzy' },
  signatureMove: phys('cauterizing-bite', 'Cauterizing Bite', 'Thaumic', 80, 100, [inflict('Bleeding', 30)]),
  ability: 'hungryForFuel',
  eligibility: "Caterpillars that race to devour anything flammable and leave a glowing, burning slime.",
  dossier: {
    nickname: "Cauterpillers",
    authors: "Dr Kondraki",
    images: [],
  },
} satisfies ScpDefinition
