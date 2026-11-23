import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-044',
  name: 'SCP-044',
  objectClass: 'Safe',
  wave: 2,
  types: ['Mechanical', 'Reality'],
  stats: { template: 'slowSpecial' },
  moves: ['fission-shell', 'refine', 'decay', 'coarse'],
  signatureMove: spec('fission-shell', 'Fission Shell', 'Mechanical', 110, 85),
  ability: 'loadedChamber',
  eligibility: 'A cannon that turns whatever is loaded into it into an explosive shell.',
  dossier: {
    nickname: 'Molecular-Fission Cannon',
    authors: 'FritzWillie',
    images: [
      { file: 'SCP-44.jpg', author: 'Department of Energy', license: 'Public Domain' },
    ],
    art: 'SCP-44.jpg',
  },
} satisfies ScpDefinition
