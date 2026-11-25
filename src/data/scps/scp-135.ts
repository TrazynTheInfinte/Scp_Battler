import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-135',
  name: 'SCP-135',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Biological', 'Temporal'],
  stats: { template: 'wall' },
  moves: ['runaway-growth', 'decay', 'coarse', 'calming-ooze'],
  moveNames: { decay: 'Cellular Chaos', coarse: 'Tumorous Mass', 'calming-ooze': 'Sluggish Growth' },
  signatureMove: spec('runaway-growth', 'Runaway Growth', 'Biological', 85, 100, [inflict('Bleeding', 30)]),
  ability: 'malignantAura',
  eligibility: "A woman whose presence causes runaway, cancerous cell growth all around her, and whom nothing has managed to kill.",
  dossier: {
    nickname: "Universal Carcinogen",
    authors: "Pig_catapult",
    images: [],
  },
} satisfies ScpDefinition
