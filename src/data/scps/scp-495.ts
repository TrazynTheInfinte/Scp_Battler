import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-495',
  name: 'SCP-495',
  objectClass: 'Safe',
  wave: 17,
  types: ['Mechanical', 'Thaumic'],
  stats: { template: 'specialBruiser' },
  moves: ['creepy-crawlers', 'gear-grind', 'smite', 'lay-snare'],
  moveNames: { 'gear-grind': 'Hot Plate', smite: 'Molten Goop', 'lay-snare': 'Plastic Bugs' },
  signatureMove: spec('creepy-crawlers', 'Creepy Crawlers', 'Mechanical', 75, 100, [inflict('Burning', 30)]),
  ability: 'hotPlate',
  eligibility: "A toy oven that bakes its plastic goop into living, scalding, venomous bugs.",
  dossier: {
    nickname: "Thingmaker",
    authors: "Ekzentric Lohner",
    images: [],
  },
} satisfies ScpDefinition
