import { NextRequest, NextResponse } from 'next/server';
import { getSealedProducts, SealedFilters } from '@/lib/catalog';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: SealedFilters = {
      query: searchParams.get('q') || undefined,
      type: searchParams.get('type') || undefined,
      setCode: searchParams.get('setCode') || undefined,
    };

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
      // Fallback
    }

    const products = getSealedProducts(filters, mep, blue);

    return NextResponse.json({
      products,
      total: products.length,
      rates: { mep, blue },
    });
  } catch (error) {
    console.error('Error al consultar producto sellado:', error);
    return NextResponse.json({ error: 'Error al consultar producto sellado' }, { status: 500 });
  }
}
