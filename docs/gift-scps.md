# Gift SCPs: granting and taking back

Gift SCPs (see `GLOSSARY.md`) are original SCPs that only Accounts holding a
Grant can field. The game never writes Grants; you add them by hand in the
Firebase console.

| Gift SCP | Id | For |
| --- | --- | --- |
| SCP-PT-1, The Lucky Break | `gift-lucky-break` | playtesters |
| SCP-ADM-1, The Phoenix | `gift-phoenix` | admin |
| SCP-ADM-2, The Conductor | `gift-conductor` | admin |
| SCP-ADM-3, The Hourglass | `gift-hourglass` | admin |

## One-time setup

The database rules must include the `grants` section and the Gift check on
Room seats. Copy `database.rules.json` into **Firebase console → Realtime
Database → Rules** and click **Publish**. Do this again whenever that file
changes.

## Give someone a Gift SCP

1. Ask them to sign in to the game once and pick a Callsign.
2. In **Firebase console → Realtime Database → Data**, open `users`. Each
   child is one Account's id; open them until you find the one whose
   `callsign` matches. Copy that id (the long key, e.g. `Xy12…`).
3. At the root of the data, hover the root and click **+** to add a child:
   - Name: `grants` (only the first time; afterwards open the existing one).
4. Under `grants`, add a child named with the Account id from step 2.
5. Under that id, add a child for each Gift SCP: name `gift-lucky-break`
   (or another id from the table), value `true`. The value must be the
   boolean `true`, not the text `"true"`.

They see it in the Team Builder within a few seconds, at the top of the list.

The finished shape looks like this:

```json
"grants": {
  "<your account id>": {
    "gift-phoenix": true,
    "gift-conductor": true,
    "gift-hourglass": true
  },
  "<a playtester's account id>": {
    "gift-lucky-break": true
  }
}
```

## Take one back

Delete that child under `grants/<account id>`. Their saved teams that use it
still load, with the slot locked (🔒) and Battle off until it's replaced;
nothing is deleted.

## What protects it

- Players can read only their own Grants and can't write any (the `grants`
  rule has no `.write`).
- A Room seat with a Gift SCP the Account doesn't hold is refused by the
  database, so it can't be used online.
- Single player only checks in the browser: the game's code ships to every
  player, so someone determined could tamper locally. That only affects their
  own single-player games.
