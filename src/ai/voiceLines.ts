import type { OpponentKind } from './opponents'

/**
 * Voice Lines (see GLOSSARY.md): what each single-player opponent says at key
 * moments, shown in a speech bubble and the battle log. Purely cosmetic: they
 * never touch the battle or its RNG. One is picked at random per trigger.
 */
export type VoiceTrigger = 'start' | 'koFoe' | 'lostOne' | 'superEffective' | 'lastLow' | 'win' | 'lose'

export const VOICE_TRIGGERS: readonly VoiceTrigger[] = ['start', 'koFoe', 'lostOne', 'superEffective', 'lastLow', 'win', 'lose']

export const VOICE_LINES: Readonly<Record<OpponentKind, Readonly<Record<VoiceTrigger, readonly string[]>>>> = {
  scientist: {
    start: ["Oh! Er, hello. This is for science, I promise.", "I've read all the files. Most of them.", 'Please let nothing escape. Again.'],
    koFoe: ['Fascinating! I mean, sorry. But fascinating.', 'Did I do that? Someone write that down.', "That wasn't my hypothesis, but I'll take it."],
    lostOne: ['No, no, that anomaly was grant-funded!', "I'll need to fill out so many forms.", 'That should not have happened, per my notes.'],
    superEffective: ['Ooh, the type chart was right!', "Textbook! Literally, it's in a textbook.", 'I knew that page would come in handy.'],
    lastLow: ['This is fine. This is a controlled experiment. Mostly.', 'Can we call it a draw? For the paper?', "I'd like to request an evacuation. For me."],
    win: ['I won? I won! Peer review, eat your heart out.', 'Results: significant. Very significant!', 'Wait until the Site Director hears about this.'],
    lose: ["Inconclusive. Let's call it inconclusive.", "I'll revise the hypothesis.", 'Back to the lab. Quietly.'],
  },
  trainer: {
    start: ["Alright, let's see what you've got! I'll even call my plays.", 'No secrets here, champ. Ready when you are!', 'Good form wins battles. Let\'s go!'],
    koFoe: ['Down goes one! Shake it off!', "That's a clean takedown!", 'Keep your guard up next time!'],
    lostOne: ['Great hit! Seriously, nice work.', "Ooh, that one's going in the highlight reel.", 'Okay, okay, you got me there.'],
    superEffective: ['Right on the weak spot!', "That's what drills are for!", 'Type matchups, baby!'],
    lastLow: ["Last one in and running on fumes. Let's finish strong!", "It's not over till it's over!", 'Dig deep! One more play!'],
    win: ["Good game! Keep training, you'll get there.", 'GG! Same time next week?', "That's what practice gets you!"],
    lose: ['GG! You earned that one.', "Great match. I'll be back with new plays.", "You've been studying. I can tell."],
  },
  mtf: {
    start: ['Command, we are engaging the hostile site.', 'Weapons free. Contain on sight.', 'Team in position. Moving in.'],
    koFoe: ['Target neutralized.', 'Hostile down. Moving to the next.', 'One anomaly secured.'],
    lostOne: ['Man down! Pull it back!', "We've lost an asset. Regroup.", 'Contact lost. Sending in the next unit.'],
    superEffective: ['Direct hit.', "That's a weak point. Keep the pressure on.", 'Effective fire. Repeat, effective.'],
    lastLow: ['Last unit, heavily damaged. Requesting backup.', "Command, we're down to one. Holding the line.", 'Running on empty. Make every shot count.'],
    win: ['Site secured. Returning to base.', 'All hostiles contained. Good work, team.', 'Mission complete.'],
    lose: ["Command, we've lost containment. Falling back.", 'Mission failed. Pull out.', 'Retreat. Repeat, retreat.'],
  },
  o5: {
    start: ['You were selected for this test. Do not disappoint.', 'The Council is watching. Proceed.', 'Every outcome has been considered. Begin.'],
    koFoe: ['Expected.', 'An acceptable loss, on your part.', 'Noted. Continue.'],
    lostOne: ['Replaceable.', 'A calculated sacrifice.', 'Interesting. It will be accounted for.'],
    superEffective: ['As projected.', 'Efficient.', 'The numbers do not lie.'],
    lastLow: ['Even now, this is within acceptable parameters.', 'Do not mistake this for weakness.', 'The Council does not retreat.'],
    win: ['Your clearance will be reviewed.', 'As it was always going to be.', 'Dismissed.'],
    lose: ['This conversation will be redacted.', 'An anomaly in the data. It will be corrected.', 'You will not remember winning this.'],
  },
  realityBender: {
    start: ["Up is down, left is cake, and you're already losing!", 'We play by MY rules. I just made them up.', 'Hehe. Which way is the floor today?'],
    koFoe: ["Poof! Did they ever exist? Who's to say!", 'Bye-bye! Unwritten!', 'Oops. I rearranged their atoms. Into nothing.'],
    lostOne: ['Nooo, I liked that one! Wrong colour, though.', 'Reality pushed back. Rude.', "Fine! I'll imagine a new one."],
    superEffective: ['A weakness? I invented that weakness just now!', 'Ha! Backwards is forwards!', 'Your types are my types now.'],
    lastLow: ['Everything is melting! Is that me?', 'Last one standing, upside down!', 'Wait, I can fix this. Probably.'],
    win: ['I win! Reality agrees, I asked it.', "Hooray! Let's do it again, but inside out!", 'That was fun. You were mostly real.'],
    lose: ["That didn't happen. I'm unhappening it.", "Boo. Reality's no fun today.", "I'll just rewrite the ending. Later."],
  },
  engineer: {
    start: ['Oh, I read your file. All of it.', 'The Foundation keeps such tidy records. Thanks for that.', 'Funny. I brought exactly what I needed.'],
    koFoe: ['Another one for the Insurgency.', 'Contained? Not anymore.', "The Foundation calls that a 'breach'. I call it Tuesday."],
    lostOne: ['Hm. A rounding error.', 'Lucky. The Foundation runs on luck these days.', 'Write it up in your little incident report.'],
    superEffective: ['Weak point, right where I knew it would be.', 'Your containment procedures. My blueprint.', 'Predictable. The whole Foundation is predictable.'],
    lastLow: ['You think this changes anything? We have more.', 'Go on. The Insurgency remembers every face.', 'Even half-wrecked, my work outlasts your procedures.'],
    win: ['Secure. Contain. Protect. Lose.', 'Tell the O5s I said hello.', 'No containment can hold us. You just proved it.'],
    lose: ["Enjoy it. It won't happen twice.", "Interesting. I'll adjust the schematics.", 'The Foundation won a round. The Insurgency wins the war.'],
  },
}

/**
 * The Engineer's reaction to each of your attacking moves (by move id): `weak`
 * when it's poorly effective against its SCP, `strong` when super effective.
 * Shared moves go by many names, so their lines say `{move}`, filled in with
 * what your SCP calls it.
 */
export const ENGINEER_MOVE_LINES: Readonly<Record<string, { weak: string; strong: string }>> = {}
