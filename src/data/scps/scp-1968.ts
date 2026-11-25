import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-1968',
  name: 'SCP-1968',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Temporal', 'Reality'],
  stats: { template: 'balanced' },
  moves: ['retrocausal-loop', 'refine', 'decay', 'negative-space'],
  moveNames: { refine: 'Rewritten Origin', decay: 'Unwritten Past', 'negative-space': 'Torus Void' },
  signatureMove: spec('retrocausal-loop', 'Retrocausal Loop', 'Temporal', 85, 100),
  ability: 'rewriteHistory',
  eligibility: "A bronze torus that rewrites its handler's past, kept as a last resort against the end of the world.",
  dossier: {
    nickname: "Global Retrocausality Torus",
    authors: "Requitefahrenheit",
    images: [],
  },
} satisfies ScpDefinition
