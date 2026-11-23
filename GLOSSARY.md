# SCP Battler

A web-based, turn-based battler themed on the SCP Foundation universe, where players pick a team from a fixed roster and fight singles battles.

## Language

**Roster**:
The full, fixed set of SCPs available to every player when building a team.
_Avoid_: Pokédex, collection, inventory

**Team**:
The six SCPs a player brings into a battle, chosen from the roster within the team budget and class limits.
_Avoid_: Party, squad, deck

**Battle**:
A singles match between two players (or a player and the AI), ending when one side has no SCPs left able to fight.
_Avoid_: Match, fight, duel

**Team Preview**:
The pre-battle phase where both full teams are revealed and each side picks which SCP starts as its active.
_Avoid_: Lead select, matchup screen

**Active**:
The one SCP on each side currently fighting; all other team members are on the bench.
_Avoid_: Lead, on-field, out

**Neutralized**:
The state of an SCP whose HP has reached 0; it can no longer fight or be switched in.
_Avoid_: Fainted, KO'd, dead, breached

**Turn Limit**:
The last turn a battle can last; a battle still undecided after it is won by the side with the larger share of its team's total HP remaining, or drawn if equal.
_Avoid_: Timeout, time limit, overtime

**Switch**:
Replacing your active SCP with a benched team member.
_Avoid_: Swap, recall

## SCPs

**SCP**:
A numbered anomaly from the SCP Foundation wiki, as a battling unit on the roster. Only numbered SCPs appear; un-numbered entities (Groups of Interest, Tale characters) do not.
_Avoid_: Anomaly, monster, creature, unit

**Eligibility**:
The rule for which SCPs may join the roster: English main-list SCPs (no -J, -EX, international-branch, or Tale entries) whose concept suggests how it would fight. Static objects and places are skipped unless iconic. Of the SCP-001 proposals, only the Gate Guardian is eligible.
_Avoid_: Canon, whitelist

**Wave**:
A batch of about twelve new SCPs added to the roster together and balanced as a group, most popular eligible SCPs first.
_Avoid_: Expansion, DLC, set, generation

**Object Class**:
An SCP's containment tier — Safe, Euclid, Keter, Thaumiel, or Apollyon — which sets its cost against the team budget. An SCP whose wiki class is something else is assigned the game class that fits its power.
_Avoid_: Rarity, tier, rank

**Team Budget**:
The maximum total object-class cost a team may have.
_Avoid_: Point cap, points limit, cost limit

**Class Limit**:
The most SCPs of one object class a team may include, on top of the team budget. Only the rarest classes (Thaumiel, Apollyon) have one.
_Avoid_: Unique clause, class cap

**Equipment**:
A Foundation-issue object an SCP carries into battle that modifies it, like a smaller ability. Each SCP carries at most one piece, and each piece may appear only once per team.
_Avoid_: Held item, item, gear

**Equipment Allowance**:
Extra points every team gets that can only be spent on Equipment, on top of whatever team budget its SCPs leave unspent.
_Avoid_: Item budget, bonus points

**Sweep**:
A battle in which one SCP Neutralizes half or more of the opposing team by itself.
_Avoid_: Wipe, carry

**Type**:
One of eight anomaly categories (Kinetic, Biological, Mechanical, Memetic, Antimemetic, Reality, Temporal, Thaumic) that determines matchup effectiveness. An SCP has one or two types; a move has exactly one.
_Avoid_: Element, class (collides with Object Class)

**Type Ring**:
The fixed circular order of the eight types; each type is super effective against the next two in the ring and resisted by them in return.
_Avoid_: Type wheel, type triangle

**Move**:
One of an SCP's four fixed actions in battle, with a type, power, accuracy, and category.
_Avoid_: Attack, skill, ability

**Move Pool**:
The shared set of moves that any SCP may be given; a move in the pool is designed and balanced once and reused across SCPs.
_Avoid_: Learnset, move list, move library

**Signature Move**:
A move unique to one SCP, outside the move pool. An SCP has at most one.
_Avoid_: Exclusive move, special move (collides with Move Category)

**Stat Template**:
A named starting spread of base stats (e.g. Fast Attacker, Wall) scaled to an object class's stat total, from which an SCP's stats may shift only slightly.
_Avoid_: Archetype, build, role

**Move Category**:
Whether a move is Physical (Attack vs Defense), Special (Sp. Attack vs Sp. Defense), or Status (deals no direct damage).
_Avoid_: Move kind, damage class

**Ability**:
An SCP's single passive trait that modifies battle rules for it, reflecting its anomalous nature. Several SCPs may share the same ability.
_Avoid_: Passive, trait, perk, power

**Status Condition**:
A lasting affliction on an SCP — Bleeding, Stunned, Amnesiac, or Contained — of which it can have at most one.
_Avoid_: Ailment, debuff, effect

**Stat Stage**:
A temporary in-battle boost or drop to a stat, from -6 to +6, cleared when the SCP switches out.
_Avoid_: Buff, debuff, modifier

**Same-Type Bonus**:
The extra damage a move deals when its type matches one of its user's types.
_Avoid_: STAB
