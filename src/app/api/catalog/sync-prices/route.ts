import { NextRequest, NextResponse } from 'next/server';
import { updateCardPrice, getCardByCode } from '@/lib/catalog';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, medianUsd, marketUsd } = body;

    if (!code || typeof medianUsd !== 'number' || typeof marketUsd !== 'number') {
      return NextResponse.json(
        { error: 'Parámetros inválidos. Requiere code, medianUsd y marketUsd numéricos.' },
        { status: 400 }
      );
    }

    const updated = updateCardPrice(code, medianUsd, marketUsd);
    if (!updated) {
      return NextResponse.json({ error: `Carta con código ${code} no encontrada.` }, { status: 404 });
    }

    const card = getCardByCode(code);

    return NextResponse.json({
      message: `Precios de TCGplayer sincronizados para ${code}`,
      card,
    });
  } catch (error) {
    console.error('Error al sincronizar precios:', error);
    return NextResponse.json({ error: 'Error al sincronizar precios' }, { status: 500 });
  }
}
