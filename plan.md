1. **Explore & Read Constraints:**
   - I need to implement `exportCollectionToCsv` and `parseCollectionCsv`.
   - The ticket is **TICKET JULES #1**.
   - Input format for parse: `code,quantity,condition,isWishlist`.
   - The CSV generator needs to produce a spreadsheet-compatible string.
   - The CSV parser needs to return `Array<{ cardCode: string, quantity: number, condition: CardCondition, isWishlist: boolean }>`.
   - It needs to validate existing codes against the catalog (`getCardByCode`).
   - Create tests in `tests/collection_io.test.ts`.
   - Create implementation in `src/lib/collectionIo.ts`.
   - Branch: `feature/jules-collection-io`.

2. **Branch Creation**:
   - `git checkout -b feature/jules-collection-io`

3. **Implementation (`src/lib/collectionIo.ts`)**:
   - `exportCollectionToCsv(items: CollectionItem[]): string`
     - Columns: `code,quantity,condition,isWishlist` (wait, the ticket says `exportCollectionToCsv` takes `items: CollectionItem[]` and it should match what `parseCollectionCsv` receives).
     - `CollectionItem` properties: `id, userId, cardCode, cardName, cardImageUrl, condition, quantity, isWishlist, acquiredPriceArs, notes, mepRate, blueRate, createdAt, updatedAt`.
     - Output columns might be more comprehensive but the ticket specifically says the import receives `code,quantity,condition,isWishlist`. Let's use `code,quantity,condition,isWishlist` as standard export headers, maybe we can add `name` and others, but the parser must handle the required ones. Let's stick to `cardCode,quantity,condition,isWishlist` (or `code` instead of `cardCode`). The requirement mentions: "importar un CSV con columnas `code,quantity,condition,isWishlist`".

   - `parseCollectionCsv(csvContent: string): Array<{ cardCode: string, quantity: number, condition: CardCondition, isWishlist: boolean }>`
     - Parse the string line by line.
     - Extract `code`, `quantity`, `condition`, `isWishlist`.
     - Validate `code` using `getCardByCode(code)`.
     - `quantity` must be integer > 0.
     - `condition` must be one of `NM`, `LP`, `MP`, `HP`, `DMG`.
     - `isWishlist` boolean parsing.

4. **Tests (`tests/collection_io.test.ts`)**:
   - Test `exportCollectionToCsv` returns correct header and data.
   - Test `parseCollectionCsv` with valid content, handling trailing spaces.
   - Test `parseCollectionCsv` skips or errors out on invalid codes. We should probably filter out invalid codes or throw an error. The requirement says "valide códigos existentes contra el catálogo". Let's ignore/skip invalid rows or throw an error per row? Usually, it's best to skip invalid rows and keep valid ones or throw if strict. Let's do a strict parser or one that skips? The prompt says "que valide códigos existentes contra el catálogo." So maybe we can skip rows that don't match or return them as errors. Let's just return valid ones, or throw on invalid. I'll throw an error for malformed rows if needed, or simply filter out the valid ones. Let's throw on malformed rows to be safe, or just ignore them. The requirement says "cobertura de casos válidos y filas malformadas". This means we should test what happens with malformed rows (maybe it throws or ignores). Let's throw an error so the user knows.

5. **Pre-commit Instructions**:
   - Run `npm run test` and `npm run build`
   - Complete pre-commit steps.

6. **Submit**:
   - Open PR, merge instructions? No, just commit and push, since the instructions say "Abre un Pull Request describiendo los criterios cumplidos", but usually I just `submit` tool to create a PR or commit to the branch.
