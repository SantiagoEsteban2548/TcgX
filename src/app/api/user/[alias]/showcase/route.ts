import { NextRequest, NextResponse } from 'next/server';
import { getUserPublicShowcase } from '@/lib/marketplace';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ alias: string }> }
) {
  try {
    const { alias } = await params;

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

    const showcase = await getUserPublicShowcase(alias, mep, blue);
    if (!showcase) {
      return NextResponse.json(
        { error: 'Usuario o colección no encontrada.' },
        { status: 404 }
      );
    }

    return NextResponse.json(showcase);
  } catch (error) {
    console.error('Error al consultar showcase del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al consultar showcase' },
      { status: 500 }
    );
  }
}
