import { NextRequest, NextResponse } from 'next/server';
import { getListings, createListing, CardCondition, ListingStatus } from '@/lib/marketplace';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const cardCode = searchParams.get('cardCode') || undefined;
    const sealedProductId = searchParams.get('sealedProductId') || undefined;
    const itemType = (searchParams.get('itemType') as 'CARD' | 'SEALED') || undefined;
    const sellerId = searchParams.get('sellerId') || undefined;
    const condition = (searchParams.get('condition') as CardCondition) || undefined;
    const status = (searchParams.get('status') as ListingStatus) || undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sortBy = (searchParams.get('sortBy') as 'price-asc' | 'price-desc' | 'recent') || undefined;

    const listings = getListings({
      cardCode,
      sealedProductId,
      itemType,
      sellerId,
      condition,
      status,
      maxPrice,
      sortBy,
    });

    return NextResponse.json({
      listings,
      total: listings.length,
    });
  } catch (error) {
    console.error('Error al consultar publicaciones:', error);
    return NextResponse.json({ error: 'Error al consultar publicaciones' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { error: 'Debés iniciar sesión para publicar en el marketplace.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      cardCode,
      sealedProductId,
      itemType = 'CARD',
      condition,
      priceArs,
      quantity,
      description,
      photos,
    } = body;

    if (itemType === 'SEALED') {
      if ((!sealedProductId && !cardCode) || !condition || !priceArs) {
        return NextResponse.json(
          { error: 'Faltan campos obligatorios para producto sellado (ID de producto, condición y precio en ARS).' },
          { status: 400 }
        );
      }
    } else {
      if (!cardCode || !condition || !priceArs) {
        return NextResponse.json(
          { error: 'Faltan campos obligatorios (código de carta, condición y precio en ARS).' },
          { status: 400 }
        );
      }
    }

    // Consultar estado de Mercado Pago del usuario
    let mpConnected = false;
    let reputationScore = 5.0;
    let totalSalesCount = 0;
    let userName = auth.alias;
    let avatarUrl = null;

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: {
          name: true,
          alias: true,
          avatarUrl: true,
          mpUserId: true,
          reputationScore: true,
          totalSalesCount: true,
        },
      });

      if (dbUser) {
        mpConnected = Boolean(dbUser.mpUserId);
        reputationScore = dbUser.reputationScore;
        totalSalesCount = dbUser.totalSalesCount;
        userName = dbUser.name || dbUser.alias;
        avatarUrl = dbUser.avatarUrl;
      }
    } catch {
      // Fallback para entorno de desarrollo si DB está en mock
      mpConnected = true;
    }

    if (!mpConnected) {
      return NextResponse.json(
        {
          error:
            'Debés vincular tu cuenta de Mercado Pago en tu perfil antes de poder publicar cartas a la venta.',
          requiresMercadoPago: true,
        },
        { status: 403 }
      );
    }

    const newListing = createListing({
      seller: {
        id: auth.userId,
        alias: auth.alias,
        name: userName,
        avatarUrl,
        reputationScore,
        totalSalesCount,
        mpConnected: true,
      },
      itemType,
      cardCode: itemType === 'SEALED' ? undefined : cardCode,
      sealedProductId: itemType === 'SEALED' ? (sealedProductId || cardCode) : undefined,
      condition,
      priceArs: Number(priceArs),
      quantity: quantity ? Number(quantity) : 1,
      description,
      photos,
    });

    return NextResponse.json(
      {
        message: 'Publicación creada exitosamente',
        listing: newListing,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear publicación:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la publicación.' },
      { status: 400 }
    );
  }
}
