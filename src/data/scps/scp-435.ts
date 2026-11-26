import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-435',
  name: 'SCP-435',
  objectClass: 'Keter',
  wave: 15,
  types: ['Antimemetic', 'Reality'],
  stats: { template: 'slowSpecial' },
  moves: ['the-dark', 'negative-space', 'refine', 'memory-hole'],
  moveNames: { 'negative-space': 'Swallowed Light', refine: 'Rewrite the Stars', 'memory-hole': 'Forgotten Sky' },
  signatureMove: spec('the-dark', 'The Dark', 'Antimemetic', 90, 100),
  ability: 'madeDark',
  eligibility: "A mythic entity that arrived with a meteorite and once put out the light of the world.",
  dossier: {
    nickname: "\"He-Who-Made-Dark\"",
    authors: "sandrewswann",
    images: [],
  },
} satisfies ScpDefinition
