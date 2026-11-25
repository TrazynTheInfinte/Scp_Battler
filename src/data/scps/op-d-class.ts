import type { ScpDefinition } from '../scp'

export default {
  id: 'op-d-class',
  name: 'D-Class',
  objectClass: 'Safe',
  wave: 3,
  types: ['Mundane'],
  stats: { template: 'balanced' },
  moves: ['strike', 'roll-out', 'stalk', 'flank'],
  moveNames: { 'roll-out': 'Duck and Roll', stalk: 'Steel Nerves', flank: 'Cheap Shot' },
  ability: 'expendable',
  eligibility: "A generic Class-D: expendable personnel sent in first to handle hazardous anomalies.",
  dossier: {
    nickname: 'Class-D Personnel',
    authors: 'Unknown Author',
    wikiUrl: 'https://scp-wiki.wikidot.com/security-clearance-levels',
    images: [],
  },
} satisfies ScpDefinition
