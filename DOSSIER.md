# Ember Clash — Dossier

## What it is

**Ember Clash — Duel of the Four Embers** is an original turn-based card
duel for one player against an AI rival, the Cinder Warden. Both fighters
have 30 life and a 24-card deck drawn from four original elements
(Ember / Tide / Thorn / Stone, told apart by colour *and* icon). Each turn
grants +1 max mana (cap 10) and a card draw; cards cost mana and deal
damage, grant shield, heal, or draw. The combo system is **Resonance**:
playing two cards of the same element in one turn gives the second +2
damage. Damage is absorbed by shields first, then life. First to 0 loses.

## How it plays

1. Title screen explains the rules; **Start Duel** (or Enter) begins.
2. Your turn: play any affordable cards by clicking them or pressing 1–7,
   then **End Turn** (or E). Cards lift on hover, fly when played, and
   floating numbers show damage / shield / healing.
3. The Warden takes its turn visibly, one card at a time, with a short
   pause between plays so its choices can be read.
4. Win and lose screens show the result, the final life totals, turns
   played, and cards played, with a Play Again button (or R).

## AI

The Warden (`src/rival.js`) scores every card in its hand: damage is worth
most (with a large bonus for lethal), shields matter more when it is hurt,
healing scales with missing life, and it never wastes a pure heal at full
life. Its choices are greedy and readable, so the player can anticipate
and counter them.

## Tech

- Static files only: `game/index.html` + CSS + ES modules, zero network
  requests, zero assets. Sounds are synthesized with WebAudio.
- No libraries vendored; the only vendored file is the kit's
  `vendor/makefun-game.ts`, unchanged.
- Deterministic demo states via `?demo=title|play|win|lose` (seeded RNG)
  exist only so the maker can photograph every screen; the game itself is
  fully playable with no parameters.

## Screenshots

1. `1-table.jpg` — mid-game table: player hand, rival hand, life totals.
2. `2-title.jpg` — title screen with rules.
3. `3-win.jpg` — victory screen.
4. `4-lose.jpg` — defeat screen.

All four are real renders of this game's own code in desktop Chrome.
