// Ember Clash — card catalogue. Four original elements, each with its own job:
// ember hits hard, tide draws cards, thorn heals, stone shields.
// A card: { id, name, element, art, cost, dmg, shield, heal, draw, text }

export const ELEMENTS = {
  ember: { name: 'Ember', icon: '🔥', color: '#c0392b' },
  tide: { name: 'Tide', icon: '💧', color: '#2471a3' },
  thorn: { name: 'Thorn', icon: '🌿', color: '#229954' },
  stone: { name: 'Stone', icon: '⬢', color: '#7d6608' },
};

const CARD_DEFS = [
  // ---- Ember: pure damage ----
  { name: 'Cinder Jab', element: 'ember', art: '🔥', cost: 1, dmg: 3, text: 'Deal 3 damage.' },
  { name: 'Cinder Jab', element: 'ember', art: '🔥', cost: 1, dmg: 3, text: 'Deal 3 damage.' },
  { name: 'Flame Lash', element: 'ember', art: '🌋', cost: 2, dmg: 5, text: 'Deal 5 damage.' },
  { name: 'Inferno Burst', element: 'ember', art: '☄️', cost: 3, dmg: 8, text: 'Deal 8 damage.' },
  { name: 'Spark Fan', element: 'ember', art: '✨', cost: 1, dmg: 2, draw: 1, text: 'Deal 2 damage. Draw a card.' },
  { name: 'Wildfire', element: 'ember', art: '🔥', cost: 2, dmg: 4, draw: 1, text: 'Deal 4 damage. Draw a card.' },
  // ---- Tide: damage + card draw ----
  { name: 'Tide Slash', element: 'tide', art: '💧', cost: 1, dmg: 2, draw: 1, text: 'Deal 2 damage. Draw a card.' },
  { name: 'Tide Slash', element: 'tide', art: '💧', cost: 1, dmg: 2, draw: 1, text: 'Deal 2 damage. Draw a card.' },
  { name: 'Wave Crash', element: 'tide', art: '🌊', cost: 2, dmg: 4, text: 'Deal 4 damage.' },
  { name: 'Deep Current', element: 'tide', art: '🌀', cost: 2, dmg: 3, draw: 1, text: 'Deal 3 damage. Draw a card.' },
  { name: 'Riptide', element: 'tide', art: '🌊', cost: 3, dmg: 7, text: 'Deal 7 damage.' },
  { name: 'Mist Veil', element: 'tide', art: '💨', cost: 1, dmg: 1, shield: 4, text: 'Deal 1 damage. Gain 4 shield.' },
  // ---- Thorn: damage + healing ----
  { name: 'Thorn Whip', element: 'thorn', art: '🌿', cost: 1, dmg: 2, heal: 2, text: 'Deal 2 damage. Heal 2 life.' },
  { name: 'Thorn Whip', element: 'thorn', art: '🌿', cost: 1, dmg: 2, heal: 2, text: 'Deal 2 damage. Heal 2 life.' },
  { name: 'Bloom Mend', element: 'thorn', art: '🌸', cost: 1, heal: 6, text: 'Heal 6 life.' },
  { name: 'Vine Snare', element: 'thorn', art: '🕸️', cost: 2, dmg: 3, shield: 3, text: 'Deal 3 damage. Gain 3 shield.' },
  { name: 'Bramble Shield', element: 'thorn', art: '🛡️', cost: 1, shield: 6, text: 'Gain 6 shield.' },
  { name: 'Root Burst', element: 'thorn', art: '🌳', cost: 3, dmg: 6, heal: 3, text: 'Deal 6 damage. Heal 3 life.' },
  // ---- Stone: shields + heavy hits ----
  { name: 'Stone Wall', element: 'stone', art: '🧱', cost: 1, shield: 5, text: 'Gain 5 shield.' },
  { name: 'Stone Wall', element: 'stone', art: '🧱', cost: 1, shield: 5, text: 'Gain 5 shield.' },
  { name: 'Boulder Slam', element: 'stone', art: '🪨', cost: 2, dmg: 4, shield: 2, text: 'Deal 4 damage. Gain 2 shield.' },
  { name: 'Granite Guard', element: 'stone', art: '⛰️', cost: 2, shield: 8, text: 'Gain 8 shield.' },
  { name: 'Quake Fist', element: 'stone', art: '💥', cost: 3, dmg: 7, text: 'Deal 7 damage.' },
  { name: 'Pebble Toss', element: 'stone', art: '🪨', cost: 1, dmg: 2, shield: 2, text: 'Deal 2 damage. Gain 2 shield.' },
];

// Build a fresh 24-card deck (unique ids per copy) and shuffle it.
export function buildDeck(random) {
  const deck = CARD_DEFS.map((def, i) => ({
    id: `card-${i}-${Math.floor(random() * 1e9)}`,
    name: def.name,
    element: def.element,
    art: def.art,
    cost: def.cost,
    dmg: def.dmg ?? 0,
    shield: def.shield ?? 0,
    heal: def.heal ?? 0,
    draw: def.draw ?? 0,
    text: def.text,
  }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Human-readable effect summary used on the card face and in the log.
export function describeCard(card, resonanceBonus = 0) {
  const parts = [];
  const dmg = card.dmg + (resonanceBonus > 0 && card.dmg > 0 ? resonanceBonus : 0);
  if (dmg > 0) parts.push(`⚔️ ${dmg}`);
  if (card.shield > 0) parts.push(`🛡 ${card.shield}`);
  if (card.heal > 0) parts.push(`❤️ ${card.heal}`);
  if (card.draw > 0) parts.push(`🂠 +${card.draw}`);
  return parts.join('  ');
}
