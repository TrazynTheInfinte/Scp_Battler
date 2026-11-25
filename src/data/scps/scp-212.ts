import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-212',
  name: 'SCP-212',
  objectClass: 'Safe',
  wave: 7,
  types: ['Mechanical'],
  stats: { template: 'physicalBruiser' },
  moves: ['unwanted-upgrade', 'crimson-residue', 'bone-saw', 'coarse'],
  signatureMove: phys('unwanted-upgrade', 'Unwanted Upgrade', 'Mechanical', 85, 100, [inflict('Bleeding', 30)]),
  ability: 'surgicalPrecision',
  eligibility: "A three-armed medical machine that restrains living things and \"improves\" them with metal, without anesthetic.",
  dossier: {
    nickname: "The Improver",
    authors: "Dr Gears",
    images: [],
  },
} satisfies ScpDefinition
