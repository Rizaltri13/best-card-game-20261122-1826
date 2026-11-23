# 🔥 Ember Clash — Duel of the Four Embers

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/Rizaltri13/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/Rizaltri13/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

An original turn-based card dueling game, built for the
[make.fun "Make the best card game" bounty](https://make.fun/bounty/best-card-game-20261122-1826).
It runs entirely from static files — no build step, no network requests — and
plays in a desktop browser with mouse and keyboard.

## The game

You are the **Emberkeeper**, dueling the **Cinder Warden** across a tavern
table. Both fighters start at **30 life**. Each turn you gain **+1 max mana**
(up to 10) and draw a card, then spend mana to play cards from your hand:

| Element | Colour / icon | Job |
|---|---|---|
| 🔥 Ember | red | raw damage |
| 💧 Tide | blue | damage + card draw |
| 🌿 Thorn | green | damage + healing |
| ⬢ Stone | brown | shields + heavy hits |

**Resonance:** play two cards of the same element in one turn and the second
deals **+2 damage** — the combo system that makes every hand a decision.

Damage hits shields first, then life. First fighter to 0 life loses. The
Warden plays a greedy, readable AI: it hunts lethal, turtles when hurt, and
heals when low — so you can read its plan and counter it.

## How to play

- **Click a card** (or press **1–7**) to play it, if you can afford its cost.
- **E** or the **End Turn** button passes to the Warden.
- **Enter** starts the duel, **R** duels again, **H** help, **M** sound.
- Sounds are synthesized live with WebAudio — no sound files.

## Play it

```sh
python3 -m http.server 8080 --directory game
# open http://localhost:8080 in desktop Chrome
```

Screenshot states (deterministic, for the maker only): `?demo=title`,
`?demo=play`, `?demo=win`, `?demo=win`.

## Layout

```
main.ts                 hand-in program (Node 22, stdlib only)
vendor/makefun-game.ts  make.fun dossier library, kit copy unchanged
game/
  index.html            table layout + overlays
  styles.css            tavern-felt styling, card art, animations
  src/cards.js          the 24-card catalogue (4 elements × 6 cards)
  src/engine.js         state machine: turns, mana, resonance, damage
  src/rival.js          Cinder Warden AI
  src/render.js         DOM painting: hands, life bars, floaters
  src/audio.js          synthesized WebAudio sound effects
  src/main.js           wiring, input, demo states
screenshots/            4 real renders of the game in Chrome
```

## License

MIT — see [LICENSE](LICENSE).
