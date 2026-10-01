import { NextResponse } from 'next/server';

interface DolarItem {
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export async function GET() {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares', {
      next: { revalidate: 300 }, // Cachear 5 minutos
    });

    if (!res.ok) {
      throw new Error(`DolarApi error: ${res.statusText}`);
    }

    const data: DolarItem[] = await res.json();

    const bolsa = data.find((d) => d.casa === 'bolsa');
    const blue = data.find((d) => d.casa === 'blue');

    return NextResponse.json({
      mep: bolsa ? bolsa.venta : 1548.7,
      blue: blue ? blue.venta : 1560.0,
      mepCompra: bolsa ? bolsa.compra : 1537.2,
      blueCompra: blue ? blue.compra : 1540.0,
      updatedAt: bolsa?.fechaActualizacion || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al consultar DolarApi:', error);
    // Fallback de contingencia
    return NextResponse.json({
      mep: 1548.7,
      blue: 1560.0,
      mepCompra: 1537.2,
      blueCompra: 1540.0,
      updatedAt: new Date().toISOString(),
      fallback: true,
    });
  }
}
