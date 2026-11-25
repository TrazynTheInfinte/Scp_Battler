import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-2897',
  name: 'SCP-2897',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Mechanical', 'Memetic'],
  stats: { template: 'fastSpecial' },
  moves: ['threat-analysis', 'corrupt-file', 'data-surge', 'dissonant-chord'],
  moveNames: { 'corrupt-file': 'Watchdog Report', 'data-surge': 'Data Mining', 'dissonant-chord': 'Bardic Verse' },
  signatureMove: spec('threat-analysis', 'Threat Analysis', 'Mechanical', 80, null),
  ability: 'patternRecognition',
  eligibility: "An analyst AI that sifts every scrap of intelligence to find anomalies and the people hiding them.",
  dossier: {
    nickname: "The Bard of Analytics",
    authors: "GreenWolf",
    images: [],
  },
} satisfies ScpDefinition
