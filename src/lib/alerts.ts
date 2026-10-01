import type { MarketplaceListing } from './marketplace';

export interface PriceAlert {
  id: string;
  userId: string;
  cardCode?: string;
  sealedProductId?: string;
  targetPriceArs?: number;
  alertType: 'PRICE_DROP' | 'RESTOCK';
  isActive: boolean;
}

export interface TriggeredAlertEvent {
  alertId: string;
  userId: string;
  listingId: string;
  alertType: 'PRICE_DROP' | 'RESTOCK';
  cardCode?: string;
  sealedProductId?: string;
  priceArs: number;
}

/**
 * Checks an array of active price alerts against an array of active marketplace listings,
 * and returns the alerts that are triggered.
 */
export function checkTriggeredAlerts(
  alerts: PriceAlert[],
  activeListings: MarketplaceListing[]
): TriggeredAlertEvent[] {
  const triggeredEvents: TriggeredAlertEvent[] = [];

  for (const alert of alerts) {
    if (!alert.isActive) continue;

    for (const listing of activeListings) {
      if (listing.status !== 'ACTIVE') continue;

      const isMatchCard = alert.cardCode && listing.itemType === 'CARD' && listing.cardCode === alert.cardCode;
      const isMatchSealed = alert.sealedProductId && listing.itemType === 'SEALED' && listing.sealedProductId === alert.sealedProductId;

      if (!isMatchCard && !isMatchSealed) continue;

      if (alert.alertType === 'PRICE_DROP' && alert.targetPriceArs) {
        if (listing.priceArs <= alert.targetPriceArs) {
          triggeredEvents.push({
            alertId: alert.id,
            userId: alert.userId,
            listingId: listing.id,
            alertType: 'PRICE_DROP',
            cardCode: listing.cardCode,
            sealedProductId: listing.sealedProductId,
            priceArs: listing.priceArs,
          });
          break; // Stop checking this alert once it triggers for a listing
        }
      } else if (alert.alertType === 'RESTOCK') {
        triggeredEvents.push({
          alertId: alert.id,
          userId: alert.userId,
          listingId: listing.id,
          alertType: 'RESTOCK',
          cardCode: listing.cardCode,
          sealedProductId: listing.sealedProductId,
          priceArs: listing.priceArs,
        });
        break; // Stop checking this alert once it triggers for a listing
      }
    }
  }

  return triggeredEvents;
}

/**
 * Formats a user-friendly notification message based on a triggered alert event.
 */
export function formatAlertNotification(event: TriggeredAlertEvent): { title: string; body: string; link: string } {
  const itemIdentifier = event.cardCode || event.sealedProductId || 'Producto';
  const priceFormatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(event.priceArs);

  if (event.alertType === 'PRICE_DROP') {
    return {
      title: `¡Bajada de precio para ${itemIdentifier}!`,
      body: `El producto ${itemIdentifier} ahora está disponible a ${priceFormatted}.`,
      link: `/listings/${event.listingId}`,
    };
  } else if (event.alertType === 'RESTOCK') {
    return {
      title: `¡${itemIdentifier} vuelve a estar en stock!`,
      body: `Hay un nuevo listing de ${itemIdentifier} disponible por ${priceFormatted}.`,
      link: `/listings/${event.listingId}`,
    };
  }

  return {
    title: 'Alerta de Mercado',
    body: 'Un artículo que sigues tiene actualizaciones.',
    link: `/listings/${event.listingId}`,
  };
}
