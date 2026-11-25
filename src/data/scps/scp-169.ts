import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-169',
  name: 'SCP-169',
  objectClass: 'Keter',
  wave: 10,
  types: ['Kinetic', 'Biological'],
  stats: { template: 'physicalBruiser' },
  moves: ['tectonic-breath', 'ram', 'crushing-jaws', 'corrosive-touch'],
  moveNames: { ram: 'Shifting Landmass', 'crushing-jaws': 'Abyssal Maw', 'corrosive-touch': 'Tidal Erosion' },
  signatureMove: phys('tectonic-breath', 'Tectonic Breath', 'Kinetic', 100, 90),
  ability: 'continentalBulk',
  eligibility: "A sea arthropod the size of a landmass, whose breathing shifts the ocean floor.",
  dossier: {
    nickname: "The Leviathan",
    authors: "Unknown Author",
    images: [],
  },
} satisfies ScpDefinition
