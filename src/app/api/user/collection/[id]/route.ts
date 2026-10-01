import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { removeFromCollection } from '@/lib/marketplace';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    const userId = auth ? auth.userId : 'user-default-collection';

    const { id } = await params;

    const removed = removeFromCollection(userId, id);
    if (!removed) {
      return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Carta eliminada de la colección' });
  } catch (error) {
    console.error('Error al eliminar de colección:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
