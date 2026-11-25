import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-5391',
  name: 'SCP-5391',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Biological', 'Kinetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['gigafauna-rampage', 'tickle', 'ambush', 'corrosive-touch'],
  moveNames: { tickle: 'Tail Swipe', ambush: 'Rising Kaiju', 'corrosive-touch': 'Magma Spew' },
  signatureMove: phys('gigafauna-rampage', 'Gigafauna Rampage', 'Kinetic', 90, 90),
  ability: 'akivaRadiation',
  eligibility: "Twenty-seven risen kaiju, from a regenerating crocodile-squid to a magma-spewing beast.",
  dossier: {
    nickname: "Anastasis",
    authors: "J Dune",
    images: [],
  },
} satisfies ScpDefinition
