import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-217',
  name: 'SCP-217',
  objectClass: 'Keter',
  wave: 7,
  types: ['Mechanical', 'Temporal'],
  stats: { template: 'balanced' },
  moves: ['clockwork-conversion', 'acidic-bile', 'decay', 'overclock'],
  signatureMove: spec('clockwork-conversion', 'Clockwork Conversion', 'Mechanical', 85, 100, [inflict('Stunned', 20)]),
  ability: 'clockworkInfection',
  eligibility: "A virus that turns flesh into gears and clockwork, spreading by touch.",
  dossier: {
    nickname: "The Clockwork Virus",
    authors: "Dr Gears",
    images: [],
  },
} satisfies ScpDefinition
