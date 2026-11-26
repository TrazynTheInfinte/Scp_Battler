import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-352',
  name: 'SCP-352',
  objectClass: 'Keter',
  wave: 14,
  types: ['Thaumic', 'Temporal'],
  stats: { template: 'fastPhysical' },
  moves: ['iron-teeth', 'relentless-pursuit', 'unmake', 'diagnose-pestilence'],
  moveNames: { 'relentless-pursuit': 'Vengeful Hunt', unmake: 'Hex of Unmaking', 'diagnose-pestilence': 'Toxic Brew' },
  signatureMove: phys('iron-teeth', 'Iron Teeth', 'Thaumic', 90, 100, [inflict('Bleeding', 20)]),
  ability: 'oldGrudges',
  eligibility: "An ancient, vengeful old woman far stronger and faster than her frail body should allow.",
  dossier: {
    nickname: "\"Baba Yaga\"",
    authors: "Dr Gears",
    images: [],
  },
} satisfies ScpDefinition
