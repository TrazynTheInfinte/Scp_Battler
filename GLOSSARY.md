# SCP Battler

A web-based, turn-based battler themed on the SCP Foundation universe, where players pick a team from a fixed roster and fight singles battles.

## Language

**Roster**:
The full, fixed set of SCPs available to every player when building a team. Gift SCPs are the one exception: they appear only for Accounts holding a Grant.
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

**Update**:
A release players would notice (a wave, a new feature, a balance change), described as what it Added, Changed and Removed. Returning players see each new Update once when they open the game; a first visit shows none. Not every deploy is an Update.
_Avoid_: Patch notes, changelog, version

**Voice Line**:
Something a single-player opponent says at a key moment of a battle (its start, a knockout, a super-effective hit, the end), shown in a speech bubble and the battle log. Cosmetic only. Online opponents and the Tutorial never speak.
_Avoid_: Taunt, quote, banter

## SCPs

**SCP**:
A numbered anomaly from the SCP Foundation wiki, as a battling unit on the roster. Only numbered SCPs appear; un-numbered entities (Groups of Interest, Tale characters) do not.
_Avoid_: Anomaly, monster, creature, unit

**Eligibility**:
The rule for which SCPs may join the roster: English main-list SCPs, plus SCP-EX (Explained) entries, which are always Mundane (no -J, international-branch, or Tale entries), whose concept suggests how it would fight. Static objects and places are skipped unless iconic. Of the SCP-001 proposals, only the Gate Guardian is eligible. The exceptions are Operatives and Friend's Picks, each added only when explicitly chosen.
_Avoid_: Canon, whitelist

**Operative**:
A named or generic human (Foundation staff, an MTF operative, or a Group of Interest member) on the roster as a rare, hand-picked exception to Eligibility. Battles exactly like an SCP, with a game object class chosen by power.
_Avoid_: Character, hero, personnel, agent

**Friend's Pick**:
An SCP that misses Eligibility (e.g. a place) but joins the roster anyway because a playtester designed a kit for it that fits its article. Rare and hand-picked, like Operatives.
_Avoid_: Fan pick, custom SCP, guest SCP

**Gift SCP**:
An original SCP made for this game rather than taken from the wiki, given to specific Accounts as a reward (to playtesters, or the admin's own). Only an Account holding a Grant for it may field it; the AI never does. It may be Mundane and has its own moves instead of Move Pool moves. Balanced like every other SCP.
_Avoid_: Custom SCP, exclusive SCP, unlock, admin SCP (say Gift SCP)

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
The most SCPs of one object class a team may include, on top of the team budget: one Thaumiel, one Apollyon, and two Keters.
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
One of the eight anomaly categories in the type ring (Kinetic, Biological, Mechanical, Memetic, Antimemetic, Reality, Temporal, Thaumic), or Mundane, that determines matchup effectiveness. An SCP has one or two types; a move has exactly one.
_Avoid_: Element, class (collides with Object Class)

**Type Ring**:
The fixed circular order of the eight types; each type is super effective against the next two in the ring and resisted by them in return.
_Avoid_: Type wheel, type triangle

**Mundane**:
The one type outside the type ring: non-anomalous force. Mundane moves are never super effective or resisted, and Mundane SCPs are never weak to or resistant against anything. Only Mundane SCPs may use Mundane moves. Every SCP-EX entry is Mundane (and only Mundane); otherwise only Operatives and Gift SCPs may be.
_Avoid_: Normal, neutral type, typeless

**Move**:
One of an SCP's four fixed actions in battle, with a type, power, accuracy, and category.
_Avoid_: Attack, skill, ability

**Move Pool**:
The shared set of moves that any SCP may be given; a move in the pool is designed and balanced once and reused across SCPs.
_Avoid_: Learnset, move list, move library

**Signature Move**:
A move unique to one SCP, outside the move pool. An SCP has at most one (Gift SCPs excepted: all their moves are their own).
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
A lasting affliction on an SCP — Bleeding, Stunned, Amnesiac, Contained, Burning, or Irradiated — of which it can have at most one.
_Avoid_: Ailment, debuff, effect

**Traps**:
Hazards laid on one side of the field by a move; every SCP that switches in on that side is hurt, more for each layer. They last the whole battle.
_Avoid_: Hazards, spikes, mines

**Priority**:
A move quality that makes it go before moves without it, whatever the Speed. An ability that always moves first (Unobserved) still beats it.
_Avoid_: Quick move, first strike

**Charge Move**:
A move that spends its first turn charging and strikes on the next; switching out or being Stunned wastes the charge.
_Avoid_: Two-turn move, wind-up

**Stat Stage**:
A temporary in-battle boost or drop to a stat, from -6 to +6, cleared when the SCP switches out.
_Avoid_: Buff, debuff, modifier

**Same-Type Bonus**:
The extra damage a move deals when its type matches one of its user's types.
_Avoid_: STAB

## Online

**Account**:
A player's Google sign-in, which holds their Callsign and Saved Teams. Needed only for online play; single-player never asks for one.
_Avoid_: Profile, login, user

**Callsign**:
The name a player chooses to show opponents online. Opponents never see the Account's real name, email, or photo.
_Avoid_: Username, display name, handle, nickname (collides with an SCP's dossier nickname)

**Saved Team**:
A named team kept for reuse, up to five. Signed in, they belong to the Account and follow it across devices; signed out, they belong to the browser.
_Avoid_: Preset, loadout, deck

**Grant**:
Permission for one Account to field one Gift SCP, given and taken back by hand by the game's admin. Taking a Grant back locks the Gift SCP out of that Account's Saved Teams without deleting them.
_Avoid_: Unlock, entitlement, ownership

**Room**:
A private meeting place for one online battle between two Accounts, created by one player and joined by the other. It disappears when the battle ends.
_Avoid_: Lobby, lobby room, session, game

**Room Code**:
The short code that identifies a Room; the creator shares it so a friend can join.
_Avoid_: Invite code, join code, room ID

**No Contest**:
How an online battle ends when the two players' games stop agreeing on what happened; nobody wins.
_Avoid_: Desync, draw (a Draw is a real result)
