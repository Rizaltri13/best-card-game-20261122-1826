// Ember Clash — the Cinder Warden's brain.
// A readable, greedy AI: it values damage most, shields when hurt, heals when
// low, and saves nothing — so its choices can be read and countered.

import { playCard, canPlay, resonanceBonusFor } from './engine.js';

// Score one card in the rival's hand right now. Higher = play it first.
export function scoreCard(game, card) {
  const me = game.rival;
  const foe = game.player;
  let score = 0;

  // Damage is king, and worth more when it can finish the player.
  const bonus = resonanceBonusFor(game, 'rival', card);
  const dmg = card.dmg + (card.dmg > 0 ? bonus : 0);
  score += dmg * 2.2;
  if (foe.life - Math.max(0, dmg - foe.shield) <= 0) score += 100; // lethal
  if (foe.life <= 8 && dmg > 0) score += 6; // smell blood

  // Shields matter most when the player can hit back hard next turn.
  const playerThreat = me.life <= 12 ? 1.6 : 1.0;
  score += card.shield * 1.1 * playerThreat;
  if (me.life <= 10 && card.shield > 0) score += 8; // turtle when hurt

  // Healing is worth more the lower the Warden's life is.
  const missing = 30 - me.life;
  score += Math.min(card.heal, missing) * (me.life <= 12 ? 2.4 : 1.2);

  // Drawing keeps the pressure on, but never at the cost of a real play.
  score += card.draw * 1.5;

  // Efficiency: prefer cheap plays early so mana is never wasted.
  score += (3 - card.cost) * 0.4;
  return score;
}

// Pick the rival's next card, or null when it should stop and end its turn.
export function chooseRivalCard(game) {
  const hand = game.rival.hand;
  let best = null;
  let bestScore = 0;
  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];
    if (!canPlay(game, 'rival', card)) continue;
    const score = scoreCard(game, card);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  // Never play a pure-heal card at full life, and never burn the last mana
  // on a draw when a damaging card is still affordable next pick.
  if (best !== null) {
    const card = hand[best];
    if (card.dmg === 0 && card.shield === 0 && card.heal > 0 && game.rival.life >= 29) return null;
    if (bestScore < 1.2) return null;
  }
  return best;
}

// Play the rival's whole turn, one card at a time, calling onPlayed after
// each card so the renderer can animate it. Resolves when the turn is done.
export function takeRivalTurn(game, onPlayed, delayMs = 750) {
  return new Promise((resolve) => {
    const step = () => {
      if (game.screen !== 'play') { resolve(); return; }
      const idx = chooseRivalCard(game);
      if (idx === null) { resolve(); return; }
      const report = playCard(game, 'rival', idx);
      if (report) onPlayed(report);
      if (game.screen !== 'play') { resolve(); return; }
      setTimeout(step, delayMs);
    };
    setTimeout(step, 500);
  });
}
