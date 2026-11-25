import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-3309',
  name: 'SCP-3309',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Antimemetic', 'Temporal'],
  stats: { template: 'fastSpecial' },
  moves: ['fade-away', 'decay', 'memory-hole', 'erasure'],
  signatureMove: spec('fade-away', 'Fade Away', 'Antimemetic', 90, 100),
  ability: 'hiddenNote',
  eligibility: "A hidden note that makes anomalies and their files fade from existence, turned into a weapon against the worst of them.",
  dossier: {
    nickname: "Where We Go When We Fade, Fade Away",
    authors: "Lt Flops and PhamtomGuy",
    images: [],
  },
} satisfies ScpDefinition
