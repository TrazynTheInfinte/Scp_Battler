import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-134',
  name: 'SCP-134',
  objectClass: 'Safe',
  wave: 10,
  types: ['Reality', 'Temporal'],
  stats: { template: 'fastSpecial' },
  moves: ['starlight-gaze', 'turn-back-time', 'negative-space', 'blinding-light'],
  moveNames: { 'turn-back-time': 'Light-Years Away', 'negative-space': 'Void Stare', 'blinding-light': 'Supernova Glint' },
  signatureMove: spec('starlight-gaze', 'Starlight Gaze', 'Reality', 80, 100, [foe({ acc: -1 }, 30)]),
  ability: 'eyesOnTheCosmos',
  eligibility: "A blind girl whose eye sockets open onto deep space, light-years away.",
  dossier: {
    nickname: "Star-Eyed Child",
    authors: "Unknown Author and Skali Sharpnose",
    images: [],
  },
} satisfies ScpDefinition
