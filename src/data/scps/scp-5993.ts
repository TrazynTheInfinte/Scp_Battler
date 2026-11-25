import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-5993',
  name: 'SCP-5993',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Biological', 'Reality'],
  stats: { template: 'fastPhysical' },
  moves: ['swarm-of-heaven', 'tickle', 'unmake', 'blink'],
  moveNames: { tickle: 'Honey Sting', unmake: 'Godless Honey', blink: 'Hive Launch' },
  signatureMove: phys('swarm-of-heaven', 'Swarm of Heaven', 'Biological', 80, 100, [inflict('Bleeding', 30)]),
  ability: 'akivaHoney',
  eligibility: "Bees whose honey cuts people off from the divine; the Foundation launches their hives at hostile gods.",
  dossier: {
    nickname: "We want you to come visit Heaven, just don't fuck with those bees",
    authors: "ch00bakka and Deadly Bread",
    images: [],
  },
} satisfies ScpDefinition
