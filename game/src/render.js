// Ember Clash — DOM renderer: cards, life bars, log, overlays, floaters.
// All DOM ids come from index.html; the engine owns the numbers, this file
// only paints them.

import { ELEMENTS, describeCard } from './cards.js';
import { MAX_LIFE, resonanceBonusFor } from './engine.js';

const $ = (id) => document.getElementById(id);

export function buildCardElement(card, opts = {}) {
  const div = document.createElement('div');
  if (opts.faceDown) {
    div.className = 'card card-back';
    div.innerHTML = `<div style="font-size:42px">🔥</div><div style="font-size:13px;font-weight:800">EMBER<br>CLASH</div>`;
    return div;
  }
  const el = ELEMENTS[card.element];
  div.className = `card ${card.element}${opts.unaffordable ? ' unaffordable' : ''}`;
  const bonus = opts.resonanceBonus || 0;
  div.innerHTML = `
    <div class="cost">${card.cost}</div>
    <div class="el-icon">${el.icon} ${el.name}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-art">${card.art}</div>
    <div class="card-text">${describeCard(card, bonus)}</div>
    ${opts.keyLabel ? `<div class="card-key">[${opts.keyLabel}]</div>` : ''}`;
  if (opts.onClick) div.addEventListener('click', opts.onClick);
  return div;
}

export function renderAll(game, ui) {
  renderFighter(game, 'player');
  renderFighter(game, 'rival');
  renderHand(game, ui);
  renderRivalHand(game);
  renderLog(game);
  renderTurn(game);
  $('endTurnBtn').disabled = game.phase !== 'player' || game.screen !== 'play';
}

function renderFighter(game, who) {
  const f = game[who];
  const fill = $(`${who}LifeFill`);
  const pct = Math.max(0, (f.life / MAX_LIFE) * 100);
  fill.style.width = `${pct}%`;
  fill.classList.toggle('low', pct <= 33);
  $(`${who}LifeText`).textContent = `${f.life} / ${MAX_LIFE}`;
  $(`${who}Shield`).textContent = `🛡 ${f.shield}`;
  $(`${who}Mana`).textContent = `◆ ${f.mana}/${f.maxMana}`;
  $(`${who}Deck`).textContent = `🂠 Deck ${f.deck.length}`;
}

function renderHand(game, ui) {
  const handEl = $('playerHand');
  handEl.innerHTML = '';
  game.player.hand.forEach((card, i) => {
    const bonus = resonanceBonusFor(game, 'player', card);
    const el = buildCardElement(card, {
      unaffordable: card.cost > game.player.mana || game.phase !== 'player',
      resonanceBonus: bonus,
      keyLabel: String(i + 1),
      onClick: () => ui.onCardClick(i),
    });
    handEl.appendChild(el);
  });
}

function renderRivalHand(game) {
  const handEl = $('rivalHand');
  handEl.innerHTML = '';
  game.rival.hand.forEach(() => {
    handEl.appendChild(buildCardElement(null, { faceDown: true }));
  });
}

function renderLog(game) {
  const logEl = $('clashLog');
  const last = game.log[0] || '';
  logEl.textContent = last;
}

function renderTurn(game) {
  const label = game.screen === 'play'
    ? (game.phase === 'player' ? `Turn ${game.turn} — Your move` : `Turn ${game.turn} — Warden is thinking…`)
    : game.screen === 'title' ? 'Duel of the Four Embers'
    : game.screen === 'win' ? 'Victory!' : 'Defeat';
  $('turnLabel').textContent = label;
}

// Show the card just played in the small slot on that side's row.
export function showPlayedCard(game, who, report) {
  const slot = $(who === 'player' ? 'playerPlayed' : 'rivalPlayed');
  slot.innerHTML = '';
  const el = buildCardElement(report.card, { resonanceBonus: report.bonus });
  el.classList.add('played-anim');
  slot.appendChild(el);
  setTimeout(() => el.classList.remove('played-anim'), 600);
}

// Resonance banner: visible while a same-element follow-up is live.
export function renderResonance(game) {
  const banner = $('resonance');
  const played = game.player.playedThisTurn;
  if (game.phase === 'player' && played.length > 0) {
    const names = [...new Set(played.map((c) => ELEMENTS[c.element].name))].join(', ');
    $('resonanceText').textContent = ` — play another ${names} card for +2 damage!`;
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

// Floating combat text over a fighter's portrait.
export function spawnFloater(who, text, kind) {
  const anchor = who === 'player' ? $('playerZone') : $('rivalZone');
  const rect = anchor.getBoundingClientRect();
  const span = document.createElement('div');
  span.className = `floater ${kind}`;
  span.textContent = text;
  span.style.left = `${rect.left + rect.width / 2 - 20}px`;
  span.style.top = `${rect.top + 20}px`;
  $('floaters').appendChild(span);
  setTimeout(() => span.remove(), 1200);
}

export function shakeFighter(who) {
  const zone = $(who === 'player' ? 'playerZone' : 'rivalZone');
  zone.classList.remove('shake');
  void zone.offsetWidth; // restart the animation
  zone.classList.add('shake');
}

export function showEndScreen(game) {
  const win = game.screen === 'win';
  $('endEmoji').textContent = win ? '🏆' : '💀';
  $('endTitle').textContent = win ? 'VICTORY!' : 'DEFEAT';
  $('endTitle').style.color = win ? '#ffd76a' : '#ff6b5e';
  $('endText').textContent = win
    ? 'The Cinder Warden bows. The four embers burn for you, Emberkeeper — the table is yours.'
    : 'The Cinder Warden stands over the table. Your embers gutter out… this time. Duel again?';
  $('endStats').innerHTML =
    `Turns played: <b>${game.turnsTaken + 1}</b> &nbsp;·&nbsp; Cards played: <b>${game.cardsPlayed}</b><br>` +
    `Your life: <b>${game.player.life}</b> &nbsp;·&nbsp; Warden's life: <b>${game.rival.life}</b>`;
  $('endScreen').classList.remove('hidden');
}

export function hideOverlays() {
  $('titleScreen').classList.add('hidden');
  $('endScreen').classList.add('hidden');
  $('helpScreen').classList.add('hidden');
}
