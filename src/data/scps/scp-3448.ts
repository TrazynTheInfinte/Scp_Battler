import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-3448',
  name: 'SCP-3448',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Thaumic', 'Antimemetic'],
  stats: { template: 'support' },
  moves: ['half-death', 'smite', 'negative-space', 'blinding-light'],
  signatureMove: spec('half-death', 'Half-Death', 'Antimemetic', 80, 100, [inflict('Amnesiac', 30)]),
  ability: 'deathHeldAtBay',
  eligibility: "A machine that sends a volunteer halfway into death to confront death itself.",
  dossier: {
    nickname: "Halfterlife",
    authors: "Captain Kirby",
    images: [],
  },
} satisfies ScpDefinition
