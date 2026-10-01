/**
 * marketplace.ts
 * Lógica central del marketplace de tcgtX:
 * - Publicaciones de vendedores (Listings) con precios propios en ARS y condición.
 * - Validación de cuenta de Mercado Pago obligatoria para publicar.
 * - Colección personal del usuario (desacoplada del inventario en venta) y valuación en ARS.
 */

import { getCardByCode } from './catalog';
import { calculateMedianDiffPercentage, convertUsdToArs } from './currency';

export type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG';
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'PAUSED' | 'CANCELLED';

export interface ListingSeller {
  id: string;
  alias: string;
  name: string | null;
  avatarUrl: string | null;
  reputationScore: number;
  totalSalesCount: number;
  mpConnected: boolean;
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  seller: ListingSeller;
  cardCode: string;
  cardName: string;
  cardImageUrl: string;
  condition: CardCondition;
  priceArs: number;
  quantity: number;
  description: string;
  photos: string[];
  status: ListingStatus;
  medianPriceUsd: number;
  medianDiffPercentage: number; // e.g. -12.5 means 12.5% below median
  isBelowMedian: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: string;
  userId: string;
  cardCode: string;
  cardName: string;
  cardImageUrl: string;
  rarity: string;
  setName: string;
  condition: CardCondition;
  quantity: number;
  isWishlist: boolean;
  notes: string;
  currentMedianUsd: number;
  estimatedValueArsMep: number;
  estimatedValueArsBlue: number;
  createdAt: string;
}

// In-memory data store for live runtime and development
let listingsStore: MarketplaceListing[] = [
  {
    id: 'listing-1',
    sellerId: 'user-demo-1',
    seller: {
      id: 'user-demo-1',
      alias: 'zoro_master',
      name: 'Roronoa Zoro',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=zoro_master',
      reputationScore: 4.9,
      totalSalesCount: 18,
      mpConnected: true,
    },
    cardCode: 'OP01-025',
    cardName: 'Roronoa Zoro (Rush)',
    cardImageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-025.jpg',
    condition: 'NM',
    priceArs: 32000,
    quantity: 2,
    description: 'Impecable sacada de sobre directo a doble folio (KMC Perfect Fit + Dragon Shield). Sin detalles.',
    photos: ['https://images.ygoprodeck.com/images/cards_optcg/OP01-025.jpg'],
    status: 'ACTIVE',
    medianPriceUsd: 24.0,
    medianDiffPercentage: -13.9,
    isBelowMedian: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'listing-2',
    sellerId: 'user-demo-2',
    seller: {
      id: 'user-demo-2',
      alias: 'strawhat_shop',
      name: 'Luffy Collectibles',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=strawhat_shop',
      reputationScore: 5.0,
      totalSalesCount: 42,
      mpConnected: true,
    },
    cardCode: 'OP01-025',
    cardName: 'Roronoa Zoro (Rush)',
    cardImageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-025.jpg',
    condition: 'LP',
    priceArs: 29500,
    quantity: 1,
    description: 'Lightly played, leve desgaste en borde superior posterior. Frente 100% impecable.',
    photos: ['https://images.ygoprodeck.com/images/cards_optcg/OP01-025.jpg'],
    status: 'ACTIVE',
    medianPriceUsd: 24.0,
    medianDiffPercentage: -20.6,
    isBelowMedian: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'listing-3',
    sellerId: 'user-demo-2',
    seller: {
      id: 'user-demo-2',
      alias: 'strawhat_shop',
      name: 'Luffy Collectibles',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=strawhat_shop',
      reputationScore: 5.0,
      totalSalesCount: 42,
      mpConnected: true,
    },
    cardCode: 'OP01-016',
    cardName: 'Nami (Searcher)',
    cardImageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-016.jpg',
    condition: 'NM',
    priceArs: 21000,
    quantity: 4,
    description: 'Playset de 4 Namis foil OP-01. Condición Near Mint.',
    photos: ['https://images.ygoprodeck.com/images/cards_optcg/OP01-016.jpg'],
    status: 'ACTIVE',
    medianPriceUsd: 14.2,
    medianDiffPercentage: -4.5,
    isBelowMedian: true,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let collectionsStore: CollectionItem[] = [
  {
    id: 'col-1',
    userId: 'user-default-collection',
    cardCode: 'OP01-120',
    cardName: 'Shanks (Manga Alt-Art)',
    cardImageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-120_p1.jpg',
    rarity: 'SEC',
    setName: 'Romance Dawn',
    condition: 'NM',
    quantity: 1,
    isWishlist: false,
    notes: 'Mi grial personal, en toploader magnetico.',
    currentMedianUsd: 840.0,
    estimatedValueArsMep: 1300908,
    estimatedValueArsBlue: 1310400,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'col-2',
    userId: 'user-default-collection',
    cardCode: 'OP05-060',
    cardName: 'Monkey D. Luffy (Gear 5 Manga Alt-Art)',
    cardImageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP05-060_p1.jpg',
    rarity: 'SEC',
    setName: 'Awakening of the New Era',
    condition: 'NM',
    quantity: 1,
    isWishlist: true,
    notes: 'Buscando cambio o compra en efectivo.',
    currentMedianUsd: 1450.0,
    estimatedValueArsMep: 2245615,
    estimatedValueArsBlue: 2262000,
    createdAt: new Date().toISOString(),
  },
];

// ----------------------------------------------------
// OPERACIONES DE PUBLICACIONES (LISTINGS)
// ----------------------------------------------------

export interface CreateListingParams {
  seller: ListingSeller;
  cardCode: string;
  condition: CardCondition;
  priceArs: number;
  quantity: number;
  description?: string;
  photos?: string[];
  mepRate?: number;
}

export function createListing(params: CreateListingParams): MarketplaceListing {
  const { seller, cardCode, condition, priceArs, quantity, description, photos, mepRate = 1548.7 } = params;

  // Validación Crítica: Mercado Pago vinculado
  if (!seller.mpConnected) {
    throw new Error('Debés vincular tu cuenta de Mercado Pago antes de publicar cartas a la venta.');
  }

  if (priceArs <= 0 || isNaN(priceArs)) {
    throw new Error('El precio en ARS debe ser un valor positivo.');
  }

  if (quantity < 1 || !Number.isInteger(quantity)) {
    throw new Error('La cantidad debe ser al menos 1 unidad entera.');
  }

  const card = getCardByCode(cardCode);
  if (!card) {
    throw new Error(`Carta con código ${cardCode} no encontrada en el catálogo.`);
  }

  // Convertir precio del vendedor a USD aproximado para calcular diff vs mediana
  const listingPriceUsd = priceArs / mepRate;
  const diffPct = calculateMedianDiffPercentage(listingPriceUsd, card.currentMedianUsd);

  const newListing: MarketplaceListing = {
    id: `listing-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sellerId: seller.id,
    seller,
    cardCode: card.code,
    cardName: card.name,
    cardImageUrl: card.imageUrl,
    condition,
    priceArs: Math.round(priceArs),
    quantity,
    description: description || 'Sin descripción adicional.',
    photos: photos && photos.length > 0 ? photos : [card.imageUrl],
    status: 'ACTIVE',
    medianPriceUsd: card.currentMedianUsd,
    medianDiffPercentage: diffPct,
    isBelowMedian: diffPct < 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  listingsStore.unshift(newListing);
  return newListing;
}

export interface ListingFilters {
  cardCode?: string;
  sellerId?: string;
  condition?: CardCondition;
  status?: ListingStatus;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'recent';
}

export function getListings(filters: ListingFilters = {}): MarketplaceListing[] {
  let result = [...listingsStore];

  if (filters.status) {
    result = result.filter((l) => l.status === filters.status);
  } else {
    // Por defecto solo activas
    result = result.filter((l) => l.status === 'ACTIVE');
  }

  if (filters.cardCode) {
    result = result.filter((l) => l.cardCode.toUpperCase() === filters.cardCode?.toUpperCase());
  }

  if (filters.sellerId) {
    result = result.filter((l) => l.sellerId === filters.sellerId);
  }

  if (filters.condition) {
    result = result.filter((l) => l.condition === filters.condition);
  }

  if (filters.maxPrice) {
    result = result.filter((l) => l.priceArs <= (filters.maxPrice as number));
  }

  if (filters.sortBy === 'price-desc') {
    result.sort((a, b) => b.priceArs - a.priceArs);
  } else if (filters.sortBy === 'recent') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // default: price-asc (mejor precio primero)
    result.sort((a, b) => a.priceArs - b.priceArs);
  }

  return result;
}

export function getListingById(id: string): MarketplaceListing | null {
  return listingsStore.find((l) => l.id === id) || null;
}

export function updateListingStatus(
  id: string,
  sellerId: string,
  status: ListingStatus
): MarketplaceListing | null {
  const listing = listingsStore.find((l) => l.id === id);
  if (!listing) return null;
  if (listing.sellerId !== sellerId) {
    throw new Error('No tenés permisos para modificar esta publicación.');
  }

  listing.status = status;
  listing.updatedAt = new Date().toISOString();
  return listing;
}

// ----------------------------------------------------
// OPERACIONES DE COLECCIÓN PERSONAL (DESACOPLADA)
// ----------------------------------------------------

export interface AddCollectionParams {
  userId: string;
  cardCode: string;
  condition?: CardCondition;
  quantity?: number;
  isWishlist?: boolean;
  notes?: string;
  mepRate?: number;
  blueRate?: number;
}

export function addToUserCollection(params: AddCollectionParams): CollectionItem {
  const {
    userId,
    cardCode,
    condition = 'NM',
    quantity = 1,
    isWishlist = false,
    notes = '',
    mepRate = 1548.7,
    blueRate = 1560.0,
  } = params;

  const card = getCardByCode(cardCode);
  if (!card) {
    throw new Error(`Carta con código ${cardCode} no existe.`);
  }

  // Verificar si ya existe en la colección con la misma condición y tipo
  const existing = collectionsStore.find(
    (c) =>
      c.userId === userId &&
      c.cardCode.toUpperCase() === cardCode.toUpperCase() &&
      c.condition === condition &&
      c.isWishlist === isWishlist
  );

  if (existing) {
    existing.quantity += quantity;
    if (notes) existing.notes = notes;
    return existing;
  }

  const newItem: CollectionItem = {
    id: `col-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    cardCode: card.code,
    cardName: card.name,
    cardImageUrl: card.imageUrl,
    rarity: card.rarity,
    setName: card.setName,
    condition,
    quantity,
    isWishlist,
    notes,
    currentMedianUsd: card.currentMedianUsd,
    estimatedValueArsMep: convertUsdToArs(card.currentMedianUsd * quantity, mepRate),
    estimatedValueArsBlue: convertUsdToArs(card.currentMedianUsd * quantity, blueRate),
    createdAt: new Date().toISOString(),
  };

  collectionsStore.unshift(newItem);
  return newItem;
}

export function getUserCollection(
  userId: string,
  mepRate = 1548.7,
  blueRate = 1560.0
): {
  items: CollectionItem[];
  ownedCount: number;
  wishlistCount: number;
  totalEstimatedArsMep: number;
  totalEstimatedArsBlue: number;
} {
  const items = collectionsStore
    .filter((c) => c.userId === userId)
    .map((item) => {
      const card = getCardByCode(item.cardCode);
      const medianUsd = card ? card.currentMedianUsd : item.currentMedianUsd;
      return {
        ...item,
        currentMedianUsd: medianUsd,
        estimatedValueArsMep: convertUsdToArs(medianUsd * item.quantity, mepRate),
        estimatedValueArsBlue: convertUsdToArs(medianUsd * item.quantity, blueRate),
      };
    });

  const ownedItems = items.filter((i) => !i.isWishlist);
  const wishlistItems = items.filter((i) => i.isWishlist);

  const totalEstimatedArsMep = ownedItems.reduce(
    (acc, curr) => acc + curr.estimatedValueArsMep,
    0
  );
  const totalEstimatedArsBlue = ownedItems.reduce(
    (acc, curr) => acc + curr.estimatedValueArsBlue,
    0
  );

  return {
    items,
    ownedCount: ownedItems.reduce((acc, curr) => acc + curr.quantity, 0),
    wishlistCount: wishlistItems.length,
    totalEstimatedArsMep,
    totalEstimatedArsBlue,
  };
}

export function removeFromCollection(userId: string, itemId: string): boolean {
  const index = collectionsStore.findIndex((c) => c.id === itemId && c.userId === userId);
  if (index === -1) return false;
  collectionsStore.splice(index, 1);
  return true;
}

export function updateListingStock(id: string, quantitySold: number): MarketplaceListing | null {
  const listing = listingsStore.find((l) => l.id === id);
  if (!listing) return null;

  listing.quantity = Math.max(0, listing.quantity - quantitySold);
  if (listing.quantity === 0) {
    listing.status = 'SOLD';
  }
  listing.updatedAt = new Date().toISOString();
  return listing;
}

export function _resetMarketplaceStore() {
  // Restablece listings de prueba
  listingsStore = [
    {
      id: 'listing-1',
      sellerId: 'seller-demo-1',
      seller: {
        id: 'seller-demo-1',
        alias: 'pirate_king_cards',
        name: 'Juan Pirata (Vendedor OP)',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=pirate_king',
        reputationScore: 4.9,
        totalSalesCount: 156,
        mpConnected: true,
      },
      cardCode: 'OP01-120',
      cardName: 'Shanks (Manga Alt-Art)',
      cardImageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-120_p1.jpg',
      condition: 'NM',
      priceArs: 1150000,
      quantity: 1,
      description: 'Guardada en perfecto estado desde que salió del sobre. Sleeve Dragon Shield + toploader ultra pro.',
      photos: ['https://images.ygoprodeck.com/images/cards_optcg/OP01-120_p1.jpg'],
      status: 'ACTIVE',
      medianPriceUsd: 840.0,
      medianDiffPercentage: -11.6,
      isBelowMedian: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'listing-2',
      sellerId: 'user-demo-2',
      seller: {
        id: 'user-demo-2',
        alias: 'strawhat_shop',
        name: 'Luffy Collectibles',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=strawhat_shop',
        reputationScore: 5.0,
        totalSalesCount: 42,
        mpConnected: true,
      },
      cardCode: 'OP01-025',
      cardName: 'Roronoa Zoro (Rush)',
      cardImageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-025.jpg',
      condition: 'LP',
      priceArs: 29500,
      quantity: 1,
      description: 'Lightly played, leve desgaste en borde superior posterior. Frente 100% impecable.',
      photos: ['https://images.ygoprodeck.com/images/cards_optcg/OP01-025.jpg'],
      status: 'ACTIVE',
      medianPriceUsd: 24.0,
      medianDiffPercentage: -20.6,
      isBelowMedian: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

