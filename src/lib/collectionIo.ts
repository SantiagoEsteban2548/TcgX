import { CollectionItem, CardCondition } from './marketplace';
import { getCardByCode } from './catalog';

export function exportCollectionToCsv(items: CollectionItem[]): string {
  const header = ['code', 'quantity', 'condition', 'isWishlist'];
  const rows = items.map((item) => {
    return [
      item.cardCode,
      item.quantity.toString(),
      item.condition,
      item.isWishlist ? 'true' : 'false',
    ].join(',');
  });

  return [header.join(','), ...rows].join('\n');
}

export function parseCollectionCsv(csvContent: string): Array<{ cardCode: string, quantity: number, condition: CardCondition, isWishlist: boolean }> {
  const lines = csvContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const codeIdx = header.indexOf('code');
  const qtyIdx = header.indexOf('quantity');
  const condIdx = header.indexOf('condition');
  const wlIdx = header.indexOf('iswishlist');

  if (codeIdx === -1 || qtyIdx === -1 || condIdx === -1 || wlIdx === -1) {
    throw new Error('CSV must contain header columns: code, quantity, condition, isWishlist');
  }

  const validConditions = ['NM', 'LP', 'MP', 'HP', 'DMG'];
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split(',').map(c => c.trim());

    if (columns.length < 4) {
      throw new Error(`Row ${i + 1} is malformed: missing columns`);
    }

    const code = columns[codeIdx];
    const qtyStr = columns[qtyIdx];
    const condStr = columns[condIdx].toUpperCase();
    const wlStr = columns[wlIdx].toLowerCase();

    const card = getCardByCode(code);
    if (!card) {
      throw new Error(`Row ${i + 1}: Invalid card code '${code}'`);
    }

    const quantity = parseInt(qtyStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error(`Row ${i + 1}: Invalid quantity '${qtyStr}'`);
    }

    if (!validConditions.includes(condStr)) {
      throw new Error(`Row ${i + 1}: Invalid condition '${condStr}'. Must be one of ${validConditions.join(', ')}`);
    }

    const isWishlist = wlStr === 'true' || wlStr === '1' || wlStr === 'yes';

    results.push({
      cardCode: card.code,
      quantity,
      condition: condStr as CardCondition,
      isWishlist,
    });
  }

  return results;
}
