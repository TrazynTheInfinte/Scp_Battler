import { status, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-131',
  name: 'SCP-131',
  objectClass: 'Safe',
  wave: 1,
  types: ['Kinetic'],
  stats: { template: 'fastPhysical', tweaks: { hp: 4, atk: -12, def: -3, spa: 6, spd: -3, spe: 8 } },
  moves: ['roll-out', 'ram', 'flank', 'keep-watch'],
  moveNames: { ram: 'Tumble Into', flank: 'Scurry Around' },
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
