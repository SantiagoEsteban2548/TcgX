import { NextRequest, NextResponse } from 'next/server';
import { getCards, getAvailableSets, CardFilters } from '@/lib/catalog';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: CardFilters = {
      query: searchParams.get('q') || undefined,
      setCode: searchParams.get('setCode') || undefined,
      rarity: searchParams.get('rarity') || undefined,
      color: searchParams.get('color') || undefined,
      type: searchParams.get('type') || undefined,
      sortBy: (searchParams.get('sortBy') as CardFilters['sortBy']) || undefined,
    };

    // Obtener cotizaciones actuales para enriquecimiento
    let mep = 1548.7;
    let blue = 1560.0;

    try {
      const currencyRes = await fetch(
        new URL('/api/currency', req.url).toString(),
        { next: { revalidate: 300 } }
      );
      if (currencyRes.ok) {
        const cData = await currencyRes.json();
        mep = cData.mep || mep;
        blue = cData.blue || blue;
      }
    } catch {
      // Usar fallbacks
    }

    const cards = getCards(filters, mep, blue);
    const sets = getAvailableSets();

    return NextResponse.json({
      cards,
      total: cards.length,
      availableSets: sets,
      rates: { mep, blue },
    });
  } catch (error) {
    console.error('Error al consultar catálogo de cartas:', error);
    return NextResponse.json({ error: 'Error al consultar catálogo' }, { status: 500 });
  }
}
