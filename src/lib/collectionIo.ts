import { CollectionItem, CardCondition } from './marketplace';
import { getCardByCode } from './catalog';

const VALID_CONDITIONS: CardCondition[] = ['NM', 'LP', 'MP', 'HP', 'DMG'];

/**
 * Exporta una lista de items de la colección a un string en formato CSV.
 * @param items Lista de CollectionItem
 * @returns string en formato CSV
 */
export function exportCollectionToCsv(items: CollectionItem[]): string {
  const headers = ['code', 'quantity', 'condition', 'isWishlist'];
  if (items.length === 0) {
    return headers.join(',');
  }

  const rows = items.map(item => {
    return [
      item.cardCode,
      item.quantity.toString(),
      item.condition,
      item.isWishlist ? 'true' : 'false'
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Parsea un string en formato CSV y retorna un arreglo de items válidos para importar.
 * Ignora filas malformadas.
 * @param csvContent string en formato CSV
 * @returns Array de objetos con datos validados de la colección
 */
export function parseCollectionCsv(csvContent: string): Array<{
  cardCode: string;
  quantity: number;
  condition: CardCondition;
  isWishlist: boolean;
}> {
  if (!csvContent || csvContent.trim() === '') {
    return [];
  }

  const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l !== '');
  if (lines.length <= 1) {
    return []; // Solo headers o vacío
  }

  // Ignoramos la primera línea (headers) y procesamos el resto
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split(',');

    // El CSV debe tener al menos 4 columnas: code, quantity, condition, isWishlist
    if (columns.length < 4) {
      continue;
    }

    const rawCode = columns[0].trim();
    const rawQuantity = columns[1].trim();
    const rawCondition = columns[2].trim() as CardCondition;
    const rawIsWishlist = columns[3].trim().toLowerCase();

    // Validar código
    const card = getCardByCode(rawCode);
    if (!card) {
      continue;
    }

    // Validar cantidad
    const quantity = parseInt(rawQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      continue;
    }

    // Validar condición
    if (!VALID_CONDITIONS.includes(rawCondition)) {
      continue;
    }

    // Validar isWishlist
    let isWishlist = false;
    if (rawIsWishlist === 'true' || rawIsWishlist === '1' || rawIsWishlist === 'yes') {
      isWishlist = true;
    } else if (rawIsWishlist === 'false' || rawIsWishlist === '0' || rawIsWishlist === 'no') {
      isWishlist = false;
    } else {
      // Valor inválido de isWishlist
      continue;
    }

    results.push({
      cardCode: card.code, // Usamos el código oficial validado
      quantity,
      condition: rawCondition,
      isWishlist
    });
  }

  return results;
}
