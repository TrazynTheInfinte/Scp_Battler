import type { ScpDefinition } from '../scp'

export default {
  id: 'op-mtf',
  name: 'MTF Operative',
  objectClass: 'Euclid',
  wave: 3,
  types: ['Mundane'],
  stats: { template: 'armoredStriker' },
  moves: ['gunfire', 'strike', 'flare', 'sedative'],
  ability: 'tacticalTraining',
  eligibility: "A generic Mobile Task Force operative: trained, armed, and sent in when an anomaly breaches.",
  dossier: {
    nickname: 'Mobile Task Force',
    authors: 'Scorpion141',
    wikiUrl: 'https://scp-wiki.wikidot.com/task-forces',
    images: [],
  },
} satisfies ScpDefinition
