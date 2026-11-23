// Ember Clash — game engine: pure state machine, no DOM here.
// Two fighters (player + rival) with 30 life, growing mana, a 24-card deck.
// Resonance: the second card of the same element played in one turn deals +2 damage.

import { buildDeck } from './cards.js';

export const MAX_LIFE = 30;
export const MAX_MANA = 10;
export const RESONANCE_BONUS = 2;

// Deterministic RNG (mulberry32) so demo / screenshot states are reproducible.
export function makeRandom(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function newFighter(random) {
  return {
    life: MAX_LIFE,
    shield: 0,
    mana: 0,
    maxMana: 0,
    deck: buildDeck(random),
    hand: [],
    discard: [],
    playedThisTurn: [],
  };
}

export function createGame(seed = (Date.now() % 2147483647)) {
  const random = makeRandom(seed);
  const game = {
    seed,
    random,
    screen: 'title', // title | play | win | lose
    turn: 1,
    phase: 'player', // player | rival | over
    player: newFighter(random),
    rival: newFighter(random),
    log: [],
    winner: null,
    cardsPlayed: 0,
    turnsTaken: 0,
  };
  drawCards(game.player, 4);
  drawCards(game.rival, 4);
  game.player.maxMana = 1;
  game.player.mana = 1;
  game.rival.maxMana = 1;
  game.rival.mana = 1;
  return game;
}

export function drawCards(fighter, n) {
  for (let i = 0; i < n; i++) {
    if (fighter.deck.length === 0) {
      if (fighter.discard.length === 0) return; // out of cards: hand stays as is
      fighter.deck = fighter.discard;
      fighter.discard = [];
      shuffleInPlace(fighter.deck);
    }
    fighter.hand.push(fighter.deck.pop());
  }
}

function shuffleInPlace(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Start a fighter's turn: +1 max mana (cap 10), refill, draw a card.
export function beginTurn(game, who) {
  const f = game[who];
  f.maxMana = Math.min(MAX_MANA, f.maxMana + 1);
  f.mana = f.maxMana;
  f.shield = 0; // shields reset at the start of your own turn
  f.playedThisTurn = [];
  drawCards(f, 1);
}

// Resonance: +2 damage when this is the 2nd+ card of the same element this turn.
export function resonanceBonusFor(game, who, card) {
  const played = game[who].playedThisTurn;
  return played.some((c) => c.element === card.element) ? RESONANCE_BONUS : 0;
}

export function canPlay(game, who, card) {
  return game.phase === who && game.screen === 'play' && card.cost <= game[who].mana;
}

// Apply one card. Returns a report of what happened, for the renderer + log.
export function playCard(game, who, handIndex) {
  const me = game[who];
  const foe = game[who === 'player' ? 'rival' : 'player'];
  const card = me.hand[handIndex];
  if (!card || !canPlay(game, who, card)) return null;

  const bonus = resonanceBonusFor(game, who, card);
  me.mana -= card.cost;
  me.hand.splice(handIndex, 1);
  me.discard.push(card);
  me.playedThisTurn.push(card);
  game.cardsPlayed++;

  const report = { card, bonus, damageDealt: 0, shieldGained: 0, healed: 0, drew: 0 };

  if (card.dmg > 0) {
    const total = card.dmg + bonus;
    const absorbed = Math.min(foe.shield, total);
    foe.shield -= absorbed;
    const through = total - absorbed;
    foe.life = Math.max(0, foe.life - through);
    report.damageDealt = total;
    report.absorbed = absorbed;
  }
  if (card.shield > 0) {
    me.shield += card.shield;
    report.shieldGained = card.shield;
  }
  if (card.heal > 0) {
    const healed = Math.min(MAX_LIFE - me.life, card.heal);
    me.life += healed;
    report.healed = healed;
  }
  if (card.draw > 0) {
    drawCards(me, card.draw);
    report.drew = card.draw;
  }

  game.log.unshift(logLine(game, who, report));
  if (game.log.length > 6) game.log.length = 6;
  checkEnd(game);
  return report;
}

function logLine(game, who, report) {
  const name = who === 'player' ? 'You' : 'Warden';
  const { card, bonus } = report;
  const bits = [];
  if (report.damageDealt > 0) bits.push(`⚔️ ${report.damageDealt} dmg${bonus ? ` (incl. +${bonus} Resonance)` : ''}`);
  if (report.shieldGained > 0) bits.push(`🛡 +${report.shieldGained}`);
  if (report.healed > 0) bits.push(`❤️ +${report.healed}`);
  if (report.drew > 0) bits.push(`🂠 +${report.drew} card`);
  return `${name} played ${card.name} — ${bits.join(', ') || '—'}`;
}

export function checkEnd(game) {
  if (game.player.life <= 0 && game.rival.life <= 0) {
    game.screen = game.player.life === game.rival.life ? 'lose' : 'win';
    game.winner = game.player.life > game.rival.life ? 'player' : 'rival';
  } else if (game.rival.life <= 0) {
    game.screen = 'win';
    game.winner = 'player';
  } else if (game.player.life <= 0) {
    game.screen = 'lose';
    game.winner = 'rival';
  }
  if (game.screen === 'win' || game.screen === 'lose') game.phase = 'over';
}

export function endPlayerTurn(game) {
  if (game.phase !== 'player' || game.screen !== 'play') return false;
  game.phase = 'rival';
  game.turnsTaken++;
  return true;
}

export function startRivalTurn(game) {
  game.turn++;
  beginTurn(game, 'rival');
  game.phase = 'rival';
}

export function startPlayerTurn(game) {
  beginTurn(game, 'player');
  game.phase = 'player';
  game.log.unshift(`— Turn ${game.turn}: your move —`);
  if (game.log.length > 6) game.log.length = 6;
}
