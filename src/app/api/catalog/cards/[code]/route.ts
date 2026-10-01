import { NextRequest, NextResponse } from 'next/server';
import { getCardByCode } from '@/lib/catalog';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

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

    const card = getCardByCode(code, mep, blue);

    if (!card) {
      return NextResponse.json({ error: 'Carta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ card, rates: { mep, blue } });
  } catch (error) {
    console.error('Error al consultar carta:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
