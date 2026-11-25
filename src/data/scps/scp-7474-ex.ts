import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-7474-ex',
  name: 'SCP-7474-EX',
  objectClass: 'Safe',
  wave: 6,
  types: ['Mundane'],
  stats: { template: 'balanced' },
  moves: ['defensive-spray', 'blast', 'brace', 'strike'],
  moveNames: { blast: 'Ray Gun', brace: 'Hunker Down', strike: 'Tentacle Slap' },
  signatureMove: spec('defensive-spray', 'Defensive Spray', 'Mundane', 85, 100, [inflict('Stunned', 20)]),
  ability: 'alienHide',
  eligibility: "A stranded alien that sprays anyone who threatens it; not anomalous, just from somewhere else.",
  dossier: {
    nickname: "Not All Aliens Are Anomalies",
    authors: "CrystalMonarch",
    images: [],
  },
} satisfies ScpDefinition
