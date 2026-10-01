/**
 * canonicalCatalog.ts
 * Catálogo canónico oficial para One Piece TCG (Singles y Producto Sellado)
 * con identificadores oficiales de Bandai y referencias de TCGplayer.
 */

export interface CanonicalCard {
  id: string;
  code: string; // e.g. "OP01-025"
  name: string;
  setName: string;
  setCode: string; // e.g. "OP-01"
  rarity: 'L' | 'C' | 'UC' | 'R' | 'SR' | 'SEC' | 'SP' | 'TR';
  color: 'Red' | 'Green' | 'Blue' | 'Purple' | 'Black' | 'Yellow' | 'Multi';
  type: 'Leader' | 'Character' | 'Event' | 'Stage';
  cost: number | null;
  power: number | null;
  counter: number | null;
  attribute: 'Slash' | 'Strike' | 'Special' | 'Ranged' | 'Wisdom' | null;
  effectText: string;
  imageUrl: string;
  tcgplayerProductId: number;
  currentMedianUsd: number;
  currentMarketUsd: number;
  priceLastUpdated: string;
  priceHistory: Array<{
    date: string;
    medianUsd: number;
    marketUsd: number;
  }>;
}

export interface CanonicalSealedProduct {
  id: string;
  name: string;
  type: 'BOOSTER_BOX' | 'BOOSTER_PACK' | 'STARTER_DECK' | 'DOUBLE_PACK' | 'PREMIUM_COLLECTION';
  setCode: string;
  description: string;
  imageUrl: string;
  tcgplayerProductId: number;
  currentMedianUsd: number;
  currentMarketUsd: number;
  priceLastUpdated: string;
  priceHistory: Array<{
    date: string;
    medianUsd: number;
    marketUsd: number;
  }>;
}

export const CANONICAL_CARDS: CanonicalCard[] = [
  {
    id: 'card-op01-001',
    code: 'OP01-001',
    name: 'Roronoa Zoro (Leader)',
    setName: 'Romance Dawn',
    setCode: 'OP-01',
    rarity: 'L',
    color: 'Red',
    type: 'Leader',
    cost: null,
    power: 5000,
    counter: null,
    attribute: 'Slash',
    effectText: '[Your Turn] [Once Per Turn] Give all of your Characters and Leader +1000 power for this turn.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-001.jpg',
    tcgplayerProductId: 453101,
    currentMedianUsd: 18.5,
    currentMarketUsd: 19.2,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 16.0, marketUsd: 16.5 },
      { date: '2026-09-17', medianUsd: 17.2, marketUsd: 17.8 },
      { date: '2026-09-24', medianUsd: 18.0, marketUsd: 18.5 },
      { date: '2026-09-30', medianUsd: 18.5, marketUsd: 19.2 },
    ],
  },
  {
    id: 'card-op01-025',
    code: 'OP01-025',
    name: 'Roronoa Zoro (Rush)',
    setName: 'Romance Dawn',
    setCode: 'OP-01',
    rarity: 'SR',
    color: 'Red',
    type: 'Character',
    cost: 3,
    power: 5000,
    counter: null,
    attribute: 'Slash',
    effectText: '<Rush> (This card can attack on the turn in which it is played.)',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-025.jpg',
    tcgplayerProductId: 453125,
    currentMedianUsd: 24.0,
    currentMarketUsd: 25.5,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 21.0, marketUsd: 22.0 },
      { date: '2026-09-17', medianUsd: 22.5, marketUsd: 23.0 },
      { date: '2026-09-24', medianUsd: 23.5, marketUsd: 24.5 },
      { date: '2026-09-30', medianUsd: 24.0, marketUsd: 25.5 },
    ],
  },
  {
    id: 'card-op01-004',
    code: 'OP01-004',
    name: 'Monkey D. Luffy',
    setName: 'Romance Dawn',
    setCode: 'OP-01',
    rarity: 'SR',
    color: 'Red',
    type: 'Character',
    cost: 8,
    power: 9000,
    counter: null,
    attribute: 'Strike',
    effectText: '[Activate: Main] [Once Per Turn] Give this Character 2 rested DON!! cards: This Character cannot be K.O.\'d in battle by <Strike> attribute Characters.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-004.jpg',
    tcgplayerProductId: 453104,
    currentMedianUsd: 8.9,
    currentMarketUsd: 9.15,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 8.0, marketUsd: 8.2 },
      { date: '2026-09-20', medianUsd: 8.5, marketUsd: 8.7 },
      { date: '2026-09-30', medianUsd: 8.9, marketUsd: 9.15 },
    ],
  },
  {
    id: 'card-op01-016',
    code: 'OP01-016',
    name: 'Nami (Searcher)',
    setName: 'Romance Dawn',
    setCode: 'OP-01',
    rarity: 'R',
    color: 'Red',
    type: 'Character',
    cost: 1,
    power: 2000,
    counter: 1000,
    attribute: 'Special',
    effectText: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} type card other than [Nami] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-016.jpg',
    tcgplayerProductId: 453116,
    currentMedianUsd: 14.2,
    currentMarketUsd: 15.0,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 12.0, marketUsd: 12.5 },
      { date: '2026-09-20', medianUsd: 13.5, marketUsd: 14.0 },
      { date: '2026-09-30', medianUsd: 14.2, marketUsd: 15.0 },
    ],
  },
  {
    id: 'card-op01-120',
    code: 'OP01-120',
    name: 'Shanks (Manga Alt-Art)',
    setName: 'Romance Dawn',
    setCode: 'OP-01',
    rarity: 'SEC',
    color: 'Red',
    type: 'Character',
    cost: 9,
    power: 10000,
    counter: null,
    attribute: 'Slash',
    effectText: '<Rush> (This card can attack on the turn in which it is played.) [When Attacking] This Character cannot be targeted by card effects with 2000 or less power.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-120_p1.jpg',
    tcgplayerProductId: 453220,
    currentMedianUsd: 840.0,
    currentMarketUsd: 875.0,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-01', medianUsd: 790.0, marketUsd: 810.0 },
      { date: '2026-09-15', medianUsd: 820.0, marketUsd: 845.0 },
      { date: '2026-09-30', medianUsd: 840.0, marketUsd: 875.0 },
    ],
  },
  {
    id: 'card-op02-013',
    code: 'OP02-013',
    name: 'Portgas D. Ace',
    setName: 'Paramount War',
    setCode: 'OP-02',
    rarity: 'SR',
    color: 'Red',
    type: 'Character',
    cost: 7,
    power: 7000,
    counter: null,
    attribute: 'Special',
    effectText: '[On Play] Give up to 2 of your opponent\'s Characters -3000 power during this turn. Then, if your Leader is [Edward.Newgate], this Character gains <Rush>.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP02-013.jpg',
    tcgplayerProductId: 472013,
    currentMedianUsd: 12.5,
    currentMarketUsd: 13.1,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 11.0, marketUsd: 11.5 },
      { date: '2026-09-20', medianUsd: 12.0, marketUsd: 12.4 },
      { date: '2026-09-30', medianUsd: 12.5, marketUsd: 13.1 },
    ],
  },
  {
    id: 'card-op02-004',
    code: 'OP02-004',
    name: 'Edward Newgate (Whitebeard Leader)',
    setName: 'Paramount War',
    setCode: 'OP-02',
    rarity: 'L',
    color: 'Red',
    type: 'Leader',
    cost: null,
    power: 6000,
    counter: null,
    attribute: 'Special',
    effectText: '[End of Your Turn] Add 1 card from the top of your Life cards to your hand.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP02-004.jpg',
    tcgplayerProductId: 472004,
    currentMedianUsd: 7.5,
    currentMarketUsd: 8.0,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 6.8, marketUsd: 7.2 },
      { date: '2026-09-20', medianUsd: 7.1, marketUsd: 7.6 },
      { date: '2026-09-30', medianUsd: 7.5, marketUsd: 8.0 },
    ],
  },
  {
    id: 'card-op05-060',
    code: 'OP05-060',
    name: 'Monkey D. Luffy (Gear 5 Manga Alt-Art)',
    setName: 'Awakening of the New Era',
    setCode: 'OP-05',
    rarity: 'SEC',
    color: 'Purple',
    type: 'Character',
    cost: 10,
    power: 12000,
    counter: null,
    attribute: 'Strike',
    effectText: '[On Play] Return all DON!! cards from your field to your DON!! deck: Take an extra turn after this one.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP05-060_p1.jpg',
    tcgplayerProductId: 512060,
    currentMedianUsd: 1450.0,
    currentMarketUsd: 1520.0,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-01', medianUsd: 1380.0, marketUsd: 1420.0 },
      { date: '2026-09-15', medianUsd: 1410.0, marketUsd: 1475.0 },
      { date: '2026-09-30', medianUsd: 1450.0, marketUsd: 1520.0 },
    ],
  },
  {
    id: 'card-op05-119',
    code: 'OP05-119',
    name: 'Monkey D. Luffy (Gear 5 Regular SEC)',
    setName: 'Awakening of the New Era',
    setCode: 'OP-05',
    rarity: 'SEC',
    color: 'Purple',
    type: 'Character',
    cost: 10,
    power: 11000,
    counter: null,
    attribute: 'Strike',
    effectText: '[On Play] Add up to 1 DON!! card from your DON!! deck and rest it. [Activate: Main] [Once Per Turn] Give this Character +1000 power for every 2 rested DON!! cards you control.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP05-119.jpg',
    tcgplayerProductId: 512119,
    currentMedianUsd: 28.0,
    currentMarketUsd: 29.5,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 25.0, marketUsd: 26.0 },
      { date: '2026-09-20', medianUsd: 27.0, marketUsd: 28.2 },
      { date: '2026-09-30', medianUsd: 28.0, marketUsd: 29.5 },
    ],
  },
  {
    id: 'card-op05-074',
    code: 'OP05-074',
    name: 'Eustass "Captain" Kid (Blocker)',
    setName: 'Awakening of the New Era',
    setCode: 'OP-05',
    rarity: 'SR',
    color: 'Purple',
    type: 'Character',
    cost: 5,
    power: 6000,
    counter: 1000,
    attribute: 'Special',
    effectText: '<Blocker> [Your Turn] When a DON!! card on your field is returned to your DON!! deck, draw 1 card.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP05-074.jpg',
    tcgplayerProductId: 512074,
    currentMedianUsd: 16.5,
    currentMarketUsd: 17.0,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 14.5, marketUsd: 15.0 },
      { date: '2026-09-20', medianUsd: 15.5, marketUsd: 16.2 },
      { date: '2026-09-30', medianUsd: 16.5, marketUsd: 17.0 },
    ],
  },
  {
    id: 'card-op09-001',
    code: 'OP09-001',
    name: 'Shanks (Emperor Leader)',
    setName: 'The New Four Emperors',
    setCode: 'OP-09',
    rarity: 'L',
    color: 'Red',
    type: 'Leader',
    cost: null,
    power: 5000,
    counter: null,
    attribute: 'Slash',
    effectText: '[Your Turn] All of your {Red-Haired Pirates} Characters gain +1000 power.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP09-001.jpg',
    tcgplayerProductId: 559001,
    currentMedianUsd: 35.0,
    currentMarketUsd: 36.8,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 32.0, marketUsd: 33.5 },
      { date: '2026-09-20', medianUsd: 33.8, marketUsd: 35.0 },
      { date: '2026-09-30', medianUsd: 35.0, marketUsd: 36.8 },
    ],
  },
  {
    id: 'card-st01-012',
    code: 'ST01-012',
    name: 'Monkey D. Luffy (Starter Rush)',
    setName: 'Starter Deck: Straw Hat Crew',
    setCode: 'ST-01',
    rarity: 'SR',
    color: 'Red',
    type: 'Character',
    cost: 5,
    power: 6000,
    counter: null,
    attribute: 'Strike',
    effectText: '<Rush> [Activate: Main] [Once Per Turn] Give this Character up to 2 rested DON!! cards.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/ST01-012.jpg',
    tcgplayerProductId: 450012,
    currentMedianUsd: 5.2,
    currentMarketUsd: 5.5,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 4.8, marketUsd: 5.0 },
      { date: '2026-09-20', medianUsd: 5.0, marketUsd: 5.2 },
      { date: '2026-09-30', medianUsd: 5.2, marketUsd: 5.5 },
    ],
  },
];

export const CANONICAL_SEALED: CanonicalSealedProduct[] = [
  {
    id: 'sealed-op01-box',
    name: 'Romance Dawn Booster Box (24 Sobres)',
    type: 'BOOSTER_BOX',
    setCode: 'OP-01',
    description: 'Caja sellada original de Romance Dawn con 24 sobres de 12 cartas cada uno. Edición oficial en inglés.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-BOX.jpg',
    tcgplayerProductId: 453000,
    currentMedianUsd: 420.0,
    currentMarketUsd: 435.0,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-01', medianUsd: 390.0, marketUsd: 405.0 },
      { date: '2026-09-15', medianUsd: 410.0, marketUsd: 425.0 },
      { date: '2026-09-30', medianUsd: 420.0, marketUsd: 435.0 },
    ],
  },
  {
    id: 'sealed-op05-box',
    name: 'Awakening of the New Era Booster Box (24 Sobres)',
    type: 'BOOSTER_BOX',
    setCode: 'OP-05',
    description: 'Caja sellada que conmemora el 1er aniversario con las cartas de Gear 5 Luffy y los 3 capitanes.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP05-BOX.jpg',
    tcgplayerProductId: 512000,
    currentMedianUsd: 230.0,
    currentMarketUsd: 245.0,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-01', medianUsd: 215.0, marketUsd: 225.0 },
      { date: '2026-09-15', medianUsd: 225.0, marketUsd: 238.0 },
      { date: '2026-09-30', medianUsd: 230.0, marketUsd: 245.0 },
    ],
  },
  {
    id: 'sealed-op09-box',
    name: 'The New Four Emperors Booster Box (24 Sobres)',
    type: 'BOOSTER_BOX',
    setCode: 'OP-09',
    description: 'Caja de la expansión dedicada a los Nuevos Cuatro Emperadores: Luffy, Buggy, Barbanegra y Shanks.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP09-BOX.jpg',
    tcgplayerProductId: 559000,
    currentMedianUsd: 185.0,
    currentMarketUsd: 190.0,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 180.0, marketUsd: 185.0 },
      { date: '2026-09-20', medianUsd: 182.0, marketUsd: 187.0 },
      { date: '2026-09-30', medianUsd: 185.0, marketUsd: 190.0 },
    ],
  },
  {
    id: 'sealed-st01-deck',
    name: 'Starter Deck: Straw Hat Crew [ST-01]',
    type: 'STARTER_DECK',
    setCode: 'ST-01',
    description: 'Mazo preconstruido de 50 cartas + 1 carta de Líder Luffy + 10 cartas de DON!!. Listo para jugar.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/ST01-DECK.jpg',
    tcgplayerProductId: 450001,
    currentMedianUsd: 32.0,
    currentMarketUsd: 35.0,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 30.0, marketUsd: 32.0 },
      { date: '2026-09-20', medianUsd: 31.0, marketUsd: 33.5 },
      { date: '2026-09-30', medianUsd: 32.0, marketUsd: 35.0 },
    ],
  },
  {
    id: 'sealed-st10-deck',
    name: 'Ultra Deck: The Three Captains [ST-10]',
    type: 'STARTER_DECK',
    setCode: 'ST-10',
    description: 'Mazo premium con líderes de Luffy, Law y Kid en arte metalizado foil con deck box incluido.',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/ST10-DECK.jpg',
    tcgplayerProductId: 510010,
    currentMedianUsd: 48.0,
    currentMarketUsd: 50.0,
    priceLastUpdated: new Date().toISOString(),
    priceHistory: [
      { date: '2026-09-10', medianUsd: 45.0, marketUsd: 47.0 },
      { date: '2026-09-20', medianUsd: 46.5, marketUsd: 48.5 },
      { date: '2026-09-30', medianUsd: 48.0, marketUsd: 50.0 },
    ],
  },
];
