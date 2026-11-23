// Ember Clash — entry point: wires the engine to the renderer, handles mouse
// + keyboard input, runs the rival's turn, and offers deterministic demo states
// (?demo=title|play|win|lose) so screenshots can be taken of every screen.

import {
  createGame, playCard, endPlayerTurn, startRivalTurn, startPlayerTurn, drawCards,
} from './engine.js';
import { takeRivalTurn } from './rival.js';
import {
  renderAll, renderResonance, showPlayedCard, spawnFloater, shakeFighter,
  showEndScreen, hideOverlays,
} from './render.js';
import { sfx, setMuted, isMuted } from './audio.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
const DEMO = params.get('demo'); // null | title | play | win | lose

let game = createGame(DEMO ? 20261122 : undefined);
let busy = false; // true while the rival is taking its turn

function refresh() {
  renderAll(game, ui);
  renderResonance(game);
}

function announceReport(who, report) {
  if (report.damageDealt > 0) {
    const foe = who === 'player' ? 'rival' : 'player';
    spawnFloater(foe, `-${report.damageDealt}`, 'dmg');
    shakeFighter(foe);
    sfx.damage();
  }
  if (report.shieldGained > 0) {
    spawnFloater(who, `+${report.shieldGained} 🛡`, 'shield');
    sfx.shield();
  }
  if (report.healed > 0) {
    spawnFloater(who, `+${report.healed} ❤️`, 'heal');
    sfx.heal();
  }
  if (report.drew > 0) sfx.draw();
}

function finishIfOver() {
  if (game.screen === 'win' || game.screen === 'lose') {
    refresh();
    showEndScreen(game);
    if (game.screen === 'win') sfx.win(); else sfx.lose();
    return true;
  }
  return false;
}

const ui = {
  onCardClick(index) {
    if (busy || game.phase !== 'player' || game.screen !== 'play') return;
    const card = game.player.hand[index];
    if (!card) return;
    const report = playCard(game, 'player', index);
    if (!report) return;
    sfx.playCard();
    showPlayedCard(game, 'player', report);
    announceReport('player', report);
    refresh();
    if (!finishIfOver()) renderResonance(game);
  },
};

async function runRivalTurn() {
  busy = true;
  refresh();
  startRivalTurn(game);
  refresh();
  await takeRivalTurn(game, (report) => {
    showPlayedCard(game, 'rival', report);
    announceReport('rival', report);
    refresh();
  });
  if (game.screen === 'play') {
    startPlayerTurn(game);
    sfx.turn();
  }
  busy = false;
  refresh();
  finishIfOver();
}

async function onEndTurn() {
  if (busy || game.phase !== 'player' || game.screen !== 'play') return;
  if (!endPlayerTurn(game)) return;
  await runRivalTurn();
}

function startDuel() {
  game = createGame();
  busy = false;
  hideOverlays();
  game.screen = 'play';
  game.log.unshift('— Turn 1: your move —');
  refresh();
  sfx.turn();
}

function bindButtons() {
  $('startBtn').addEventListener('click', startDuel);
  $('againBtn').addEventListener('click', startDuel);
  $('endTurnBtn').addEventListener('click', () => void onEndTurn());
  $('helpBtn').addEventListener('click', () => $('helpScreen').classList.remove('hidden'));
  $('closeHelpBtn').addEventListener('click', () => $('helpScreen').classList.add('hidden'));
  $('soundBtn').addEventListener('click', () => {
    const nowMuted = setMuted(!isMuted());
    $('soundBtn').textContent = nowMuted ? '♪ Off' : '♪ On';
  });
}

function bindKeyboard() {
  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (game.screen === 'title' && (key === 'enter' || key === ' ')) { startDuel(); return; }
    if ((game.screen === 'win' || game.screen === 'lose') && key === 'r') { startDuel(); return; }
    if (key === 'h') { $('helpScreen').classList.toggle('hidden'); return; }
    if (key === 'm') { $('soundBtn').click(); return; }
    if (game.screen !== 'play') return;
    if (key === 'e' || key === 'enter') { void onEndTurn(); return; }
    const slot = Number.parseInt(key, 10);
    if (slot >= 1 && slot <= 7) ui.onCardClick(slot - 1);
  });
}

// ---- Demo states (for screenshots): deterministic, seeded, no input needed ----
function applyDemo() {
  if (!DEMO || DEMO === 'title') return;
  hideOverlays();
  game.screen = 'play';
  if (DEMO === 'play') {
    // A rich mid-game table: a few turns in, both hands full, shields up.
    game.player.life = 24; game.rival.life = 19;
    game.player.shield = 4; game.rival.shield = 3;
    game.player.maxMana = 5; game.player.mana = 4;
    game.rival.maxMana = 5; game.rival.mana = 2;
    game.turn = 4;
    drawCards(game.player, 3); // a full 7-card hand for the screenshot
    drawCards(game.rival, 2); // a fuller rival hand too
    game.log.unshift('You played Flame Lash — ⚔️ 5 dmg');
    game.log.unshift('Warden played Stone Wall — 🛡 +5');
    game.log.unshift('— Turn 4: your move —');
    // Pretend an Ember card was already played this turn, so the Resonance
    // banner (the combo mechanic) shows in the screenshot.
    const emberCard = game.player.hand.find((c) => c.element === 'ember');
    if (emberCard) game.player.playedThisTurn = [emberCard];
    const last = game.player.hand[0];
    if (last) showPlayedCard(game, 'player', { card: last, bonus: 0 });
    const rlast = game.rival.hand[0];
    if (rlast) showPlayedCard(game, 'rival', { card: rlast, bonus: 0 });
  } else if (DEMO === 'win') {
    game.rival.life = 0;
    game.player.life = 11;
    game.turn = 7; game.turnsTaken = 6; game.cardsPlayed = 21;
    game.screen = 'win'; game.winner = 'player';
    showEndScreen(game);
  } else if (DEMO === 'lose') {
    game.player.life = 0;
    game.rival.life = 14;
    game.turn = 8; game.turnsTaken = 7; game.cardsPlayed = 24;
    game.screen = 'lose'; game.winner = 'rival';
    showEndScreen(game);
  }
  refresh();
}

bindButtons();
bindKeyboard();
refresh();
applyDemo();

// Expose the live game for play-testing from the console / automation.
window.__emberClash = { get game() { return game; }, startDuel, onEndTurn };
