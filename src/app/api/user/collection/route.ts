import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUserCollection, addToUserCollection, CardCondition } from '@/lib/marketplace';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    const userId = auth ? auth.userId : 'user-default-collection';

    // Cotizaciones
    let mep = 1548.7;
    let blue = 1560.0;

    try {
      const cRes = await fetch(new URL('/api/currency', req.url).toString(), {
        next: { revalidate: 300 },
      });
      if (cRes.ok) {
        const cData = await cRes.json();
        mep = cData.mep || mep;
        blue = cData.blue || blue;
      }
    } catch {
      // Fallback
    }

    const collection = getUserCollection(userId, mep, blue);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error al consultar colección:', error);
    return NextResponse.json({ error: 'Error al consultar colección' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    const userId = auth ? auth.userId : 'user-default-collection';

    const body = await req.json();
    const { cardCode, condition, quantity, isWishlist, notes } = body;

    if (!cardCode) {
      return NextResponse.json(
        { error: 'El código de la carta es obligatorio.' },
        { status: 400 }
      );
    }

    const item = addToUserCollection({
      userId,
      cardCode,
      condition: (condition as CardCondition) || 'NM',
      quantity: quantity ? Number(quantity) : 1,
      isWishlist: Boolean(isWishlist),
      notes: notes || '',
    });

    return NextResponse.json({
      message: isWishlist ? 'Carta añadida a tu Wishlist' : 'Carta añadida a tu Colección personal',
      item,
    });
  } catch (error: any) {
    console.error('Error al agregar a colección:', error);
    return NextResponse.json(
      { error: error.message || 'Error al guardar carta' },
      { status: 400 }
    );
  }
}
