import { NextResponse } from 'next/server';
import { confirmOrderPayment } from '@/lib/orders';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic') || searchParams.get('type');
    const id = searchParams.get('id') || searchParams.get('data.id');

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Puede venir sin body o urlencoded
    }

    const eventType = body?.type || topic || '';
    const paymentId = body?.data?.id || id || '';

    // Manejar eventos de pago
    if (eventType === 'payment' && paymentId) {
      // Si hay credenciales reales de Mercado Pago configuradas, consultamos el pago
      if (MP_ACCESS_TOKEN && MP_ACCESS_TOKEN !== 'TEST-mock-token') {
        try {
          const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
          const payment = new Payment(client);
          const paymentData = await payment.get({ id: paymentId });

          if (paymentData.status === 'approved' && paymentData.external_reference) {
            await confirmOrderPayment(paymentData.external_reference, String(paymentData.id), 'approved');
          }
        } catch (mpErr: any) {
          console.warn('Error al verificar pago en Mercado Pago API:', mpErr.message);
        }
      }
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Error procesando webhook de Mercado Pago:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
