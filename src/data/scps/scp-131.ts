import { status, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-131',
  name: 'SCP-131',
  objectClass: 'Safe',
  types: ['Kinetic'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 70, atk: 85, def: 55, spa: 50, spd: 55, spe: 135 } },
  moves: ['roll-out', 'ram', 'flank', 'keep-watch'],
  signatureMove: status('keep-watch', 'Keep Watch', 'Memetic', 100, [foe({ spe: -1 })]),
  ability: 'everWatchful',
  eligibility: 'Mobile creatures that watch and follow anomalies.',
  dossier: {
    nickname: 'The "Eye Pods"',
    authors: 'Unknown Author',
    images: [
      { file: '131volgun.png', author: 'VolgunStrife', license: 'CC BY-SA 3.0' },
    ],
    art: '131volgun.png',
  },
} satisfies ScpDefinition
