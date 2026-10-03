<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Contexto y Normas de Desarrollo para tcgtX

Este documento guía a cualquier agente (Antigravity, Jules, etc.) que trabaje sobre este repositorio.

## 1. Visión del Producto
**tcgtX** es un marketplace de compra-venta de cartas de **One Piece TCG** (singles y producto sellado) para Argentina/LatAm.
- Precios de referencia: **TCGplayer** (mediana obligatoria de lanzamiento y mercado).
- Conversión a ARS: Dólar **MEP** y **Blue** en vivo (vía DolarApi).
- Moneda y Pagos: **Mercado Pago** en modo split (OAuth 2.0 marketplace fee).
- Cobertura: Singles (con códigos como OP01-001, rareza, condición NM/LP/MP/HP/DMG) y Producto Sellado (Booster boxes, packs, starter decks).

## 2. Stack Tecnológico
- **Framework**: Next.js 15+ (App Router, TypeScript, React 19).
- **Estilos**: Tailwind CSS v4. Guía visual en `design.md`.
- **Base de Datos & ORM**: PostgreSQL con Prisma ORM (`prisma/schema.prisma`).
- **Testing**: Vitest (`npm run test`).
- **Cotizaciones**: DolarApi (`https://dolarapi.com/v1/dolares`).

## 3. Reglas Críticas e Inviolables
1. **Tests Obligatorios**: Toda lógica que involucre cálculo de precios, márgenes, conversión de monedas (USD -> ARS MEP/Blue) o flujo de pagos DEBE tener tests automáticos en `tests/` antes de considerarse completa.
2. **Credenciales y Seguridad**: NUNCA hardcodear API keys, client secrets o access tokens en el código. Usar siempre `process.env`.
3. **Modo Sandbox**: Mercado Pago debe permanecer SIEMPRE en modo sandbox/test durante el desarrollo.
4. **Desacoplamiento de Catálogos**:
   - `Card` / `Product`: Catálogo canónico (referencia oficial y TCGplayer).
   - `Listing`: Publicación individual de un vendedor (precio propio en ARS, condición, fotos, stock).
   - `UserCollection`: Registro personal de cartas del usuario (separado de lo que está en venta).

## 4. Formato de Tickets para Delegación a Jules
Cuando se asigne una tarea a Jules, el ticket debe redactarse con esta estructura:
```markdown
### TICKET JULES: [Nombre de la Tarea]
- **Objetivo**: [Descripción en 1-2 líneas del entregable]
- **Criterios de Aceptación**:
  - [ ] Criterio 1 (e.g. tests que deben pasar)
  - [ ] Criterio 2 (e.g. validaciones de schema)
- **Contexto del Repo**:
  - Archivos a modificar / crear: [...]
  - Módulos de referencia: [...]
- **Qué NO hacer**:
  - [Restricciones explícitas, e.g. no modificar schema de precios, no tocar auth, etc.]
```

## 5. Protocolo de Trabajo Asincrónico: Antigravity + Jules

1. **Flujo de Asignación**:
   - Antigravity define y actualiza los tickets en la sección **6. Cola de Tareas para Jules** de este archivo (`AGENTS.md`).
   - Cada ticket tiene estado: `[PENDIENTE]` | `[EN PROGRESO]` | `[LISTO PARA REVISIÓN]` | `[COMPLETADO]`.
2. **Desarrollo por Jules**:
   - Jules toma un ticket en estado `[PENDIENTE]`.
   - Crea un branch `feature/jules-[nombre-corto]`.
   - Implementa código y tests automáticos en `tests/`.
   - Abre un Pull Request describiendo los criterios cumplidos.
3. **Revisión e Integración por Antigravity**:
   - Antigravity verifica el PR ejecutando los tests (`npm run test`) y el build (`npm run build`).
   - Revisa alineación arquitectónica y diseño visual antes de mergear a `main`.

---

## 6. Cola de Tareas para Jules (Tickets Listos)

### TICKET JULES #1: Exportador e Importador de Colección en CSV / JSON
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Implementar un servicio para exportar la colección personal y wishlist de un usuario a formato CSV y JSON, y permitir importar un CSV con columnas `code,quantity,condition,isWishlist`.
- **Criterios de Aceptación**:
  - [ ] Función `exportCollectionToCsv(items: CollectionItem[]): string` que genere formato compatible con hojas de cálculo.
  - [ ] Función `parseCollectionCsv(csvContent: string): Array<{ cardCode: string, quantity: number, condition: CardCondition, isWishlist: boolean }>` que valide códigos existentes contra el catálogo.
  - [ ] Tests en `tests/collection_io.test.ts` con cobertura de casos válidos y filas malformadas.
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/collectionIo.ts`
  - Tests a crear: `tests/collection_io.test.ts`
  - Referencias: `src/lib/marketplace.ts` (`CollectionItem`, `getUserCollection`).
- **Qué NO hacer**:
  - No modificar la UI ni rutas existentes de `/profile`.
  - No tocar la lógica de cotizaciones de divisas.

### TICKET JULES #2: Filtro de Búsqueda Avanzada por Atributos de Juego (Power, Cost, Counter)
- **Estado**: `[COMPLETADO]`
- **Objetivo**: Extender `CardFilters` en `src/lib/catalog.ts` para permitir rangos numéricos de filtro: costo mínimo/máximo, poder mínimo/máximo y valor de contraataque (Counter 1000/2000).
- **Criterios de Aceptación**:
  - [x] Soporte para `minCost`, `maxCost`, `minPower`, `maxPower`, `counter` en `CardFilters` y `getCards()`.
  - [x] Tests unitarios en `tests/catalog.test.ts` verificando filtros combinados (ej: cartas rojas con costo <= 3 y power >= 5000).
- **Contexto del Repo**:
  - Archivos a modificar: `src/lib/catalog.ts`, `tests/catalog.test.ts`.
- **Qué NO hacer**:
  - No romper los filtros existentes (`query`, `setCode`, `rarity`, `color`, `type`).

### TICKET JULES #3: Validador y Parser de Mazo / Decklists (OPTCG Decklist Parser & Cost Estimator)
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Implementar un parser que tome un texto de decklist (e.g. exportado de OPTCGSim o sitios de torneos con líneas como `1x OP01-001`, `4x ST01-006`), valide las reglas oficiales del juego y calcule el costo estimado total en ARS según la mediana y los listings más baratos activos.
- **Criterios de Aceptación**:
  - [ ] Función `parseDecklist(text: string): ParsedDeck` con desglose de líder, cartas principales y cantidades.
  - [ ] Función `validateDeckRules(deck: ParsedDeck): { isValid: boolean, errors: string[] }` (validar: exactamente 1 Líder, 50 cartas de mazo, máx 4 copias por carta, colores compatibles con el Líder).
  - [ ] Función `calculateDeckEstimate(deck: ParsedDeck, listings: Listing[]): DeckCostEstimate` que devuelva costo total en ARS (MEP y Blue) y porcentaje de cartas con stock disponible en el marketplace.
  - [ ] Tests completos en `tests/deck_parser.test.ts` cubriendo mazos válidos, con >4 copias, colores inconsistentes y cálculo de precios.
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/deckParser.ts`
  - Tests a crear: `tests/deck_parser.test.ts`
  - Referencias: `src/lib/catalog.ts` (`Card`), `src/lib/marketplace.ts` (`Listing`).
- **Qué NO hacer**:
  - No crear vistas ni alterar rutas existentes. Mantenerlo como módulo funcional puro.

### TICKET JULES #4: Calculadora de Envíos y Tarifas por Región de Argentina (Shipping Calculator)
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Diseñar e implementar un calculador de opciones y costos estimados de envío local en Argentina según el destino geográfico y tipo de paquete (singles vs cajas selladas).
- **Criterios de Aceptación**:
  - [ ] Definir métodos de entrega: `MEETUP` (Punto de encuentro/LGS sin costo), `STANDARD_NATIONAL` (Correo Argentino/Andreani sucursal), `EXPRESS_NATIONAL` (Domicilio express).
  - [ ] Función `calculateShippingQuote(originZip: string, destZip: string, items: Array<{ itemType: 'CARD' | 'SEALED', quantity: number }>): ShippingQuoteResult`.
  - [ ] Contemplar zonas: CABA, Gran Buenos Aires (AMBA), Interior Centro/Norte, y Patagonia/Tierra del Fuego (con recargo de distancia).
  - [ ] Regla de bonificación: soporte de envío gratis si el total del pedido supera un umbral parametrizable.
  - [ ] Tests en `tests/shipping.test.ts` validando todas las zonas y combinaciones de peso/volumen.
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/shipping.ts`
  - Tests a crear: `tests/shipping.test.ts`
- **Qué NO hacer**:
  - No llamar APIs externas de correo con credenciales; utilizar la matriz de estimación tarifaria interna por rangos de código postal.

### TICKET JULES #5: Sistema de Alertas de Precios y Disponibilidad (Price Drop & Restock Alerts Engine)
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Crear el motor de evaluación para alertas de precio y restock definidas por los usuarios (e.g. "Avisarme si OP01-016 baja de $10.000 ARS" o "Avisarme cuando haya stock de OP-05 Booster Box").
- **Criterios de Aceptación**:
  - [ ] Estructura de tipos `PriceAlert` (id, userId, cardCode?, sealedProductId?, targetPriceArs?, alertType: 'PRICE_DROP' | 'RESTOCK', isActive).
  - [ ] Función `checkTriggeredAlerts(alerts: PriceAlert[], activeListings: Listing[]): TriggeredAlertEvent[]` que evalúe y filtre qué alertas coinciden con el inventario actual.
  - [ ] Función `formatAlertNotification(event: TriggeredAlertEvent): { title: string, body: string, link: string }` para armar el mensaje de alerta.
  - [ ] Tests en `tests/alerts.test.ts` evaluando bajas de precio, nuevos listings en stock y descarte de listings por encima del precio objetivo.
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/alerts.ts`
  - Tests a crear: `tests/alerts.test.ts`
  - Referencias: `src/lib/marketplace.ts`.
- **Qué NO hacer**:
  - No configurar servidores SMTP ni enviar correos reales.

### TICKET JULES #6: Validador y Sanitizador de Publicaciones / Listings (Listing Integrity & Safety Engine)
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Crear un motor de reglas de negocio para listings antes de publicarse, asegurando consistencia de precios, control anti-outlier y sanitización de seguridad para proteger a los usuarios.
- **Criterios de Aceptación**:
  - [ ] Función `validateListingInput(input: CreateListingInput, marketMedianArs: number): ListingValidationResult`.
  - [ ] Validar que el precio en ARS no sea absurdamente bajo (< 15% de la mediana) ni absurdamente alto (> 600% de la mediana) sin flag explícito de carta especial/autografiada.
  - [ ] Sanitización de seguridad en `notes`: detectar y bloquear automáticamente números de teléfono, direcciones de email o enlaces sospechosos externos que violen la política de seguridad anti-desvío de pagos fuera de Mercado Pago.
  - [ ] Tests en `tests/listing_validator.test.ts` cubriendo intentos de evasión, precios extremos y textos limpios válidos.
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/listingValidator.ts`
  - Tests a crear: `tests/listing_validator.test.ts`
- **Qué NO hacer**:
  - No alterar la firma de `createListing` en `marketplace.ts`; este validador se invoca antes.

### TICKET JULES #7: Generador de Reportes de Mercado y Variaciones de Precio (Price Trends & Market Movers)
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Implementar utilidades analíticas sobre el histórico de precios de TCGplayer (`priceHistory`) para singles y producto sellado, identificando variaciones periódicas de valor.
- **Criterios de Aceptación**:
  - [ ] Función `getTopMarketMovers(periodDays: number, limit?: number): { topGainers: MarketMover[], topLosers: MarketMover[] }` calculando variación porcentual y absoluta en USD y ARS.
  - [ ] Función `calculateVolatilityIndex(cardCode: string): number` que mida la desviación de precio reciente.
  - [ ] Tests unitarios en `tests/market_analytics.test.ts` con datos sintéticos de historial y verificación de ordenamiento correcto.
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/marketAnalytics.ts`
  - Tests a crear: `tests/market_analytics.test.ts`
  - Referencias: `src/lib/catalog.ts` (`MOCK_CARDS`, `PriceHistoryEntry`).
- **Qué NO hacer**:
  - No depender de peticiones HTTP en los tests; usar datos estructurados en memoria.

### TICKET JULES #8: Comparador de Colección vs Decks y Generador de Wantlist (Wantlist & Missing Cards Finder)
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Crear un comparador que contraste el inventario de la colección personal de un usuario (`UserCollection`) con una lista requerida (deck o wishlist), calculando faltantes y localizando los listings más baratos en el marketplace.
- **Criterios de Aceptación**:
  - [ ] Función `findMissingDeckCards(deckCards: Array<{ code: string, requiredQty: number }>, userInventory: CollectionItem[]): Array<{ code: string, neededQty: number }>`.
  - [ ] Función `resolveBestBuyPlan(missingCards: Array<{ code: string, neededQty: number }>, activeListings: Listing[]): BuyPlanResult` con desglose de vendedores y costo total optimizado.
  - [ ] Tests en `tests/deck_optimizer.test.ts` verificando colecciones completas, faltantes parciales y agrupamiento óptimo por vendedor.
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/deckOptimizer.ts`
  - Tests a crear: `tests/deck_optimizer.test.ts`
  - Referencias: `src/lib/marketplace.ts`.
- **Qué NO hacer**:
  - No crear carritos persistentes en base de datos; el módulo debe ser una función analítica pura.

### TICKET JULES #9: Generador de Comprobantes de Venta y Resumen de Orden (Order Invoice & Packing Slip Generator)
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Crear una utilidad que genere un comprobante estructurado en texto plano y HTML semántico imprimible para órdenes completadas (`PAID`), detallando ítems, condición, comisiones y cotización de dólar aplicada.
- **Criterios de Aceptación**:
  - [ ] Función `generateOrderPackingSlipHtml(order: Order, cardDetailsMap: Record<string, Card>): string` retornando HTML estilizado con CSS de impresión (`@media print`).
  - [ ] Función `generateOrderSummaryText(order: Order): string` en formato texto monoespaciado para enviar por chat interno.
  - [ ] Debe incluir obligatoriamente: ID de orden, ID de pago Mercado Pago, cotización MEP/Blue congelada, desglose del fee de la plataforma y datos del comprador/vendedor.
  - [ ] Tests en `tests/order_invoice.test.ts` verificando la presencia de todos los campos financieros requeridos.
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/orderInvoice.ts`
  - Tests a crear: `tests/order_invoice.test.ts`
  - Referencias: `src/lib/orders.ts`.
- **Qué NO hacer**:
  - No usar dependencias pesadas de PDF (ej. puppeteer); usar HTML semántico estándar.

### TICKET JULES #10: Motor de Matching para Intercambios / Trades P2P (Trade Matcher Engine)
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Implementar un motor que reciba las colecciones y wishlists de dos usuarios y determine coincidencias de trade (qué cartas tiene A que busca B, y viceversa), calculando la diferencia de valor en ARS según la mediana para sugerir equilibrio monetario.
- **Criterios de Aceptación**:
  - [ ] Función `matchUserTrade(userACollection: CollectionItem[], userBCollection: CollectionItem[]): TradeMatchResult`.
  - [ ] Retornar `userAGives`, `userBGives`, `valueAInArs`, `valueBInArs`, `cashDifference`, y `suggestedPayer: 'USER_A' | 'USER_B' | 'BALANCED'`.
  - [ ] Tests en `tests/trade_matcher.test.ts` con intercambios exactos, trades con compensación económica y sin coincidencias.
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/tradeMatcher.ts`
  - Tests a crear: `tests/trade_matcher.test.ts`
  - Referencias: `src/lib/marketplace.ts`, `src/lib/currency.ts`.
- **Qué NO hacer**:
  - No alterar endpoints ni esquemas de bases de datos.

### TICKET JULES #11: Verificador Criptográfico y Parser de Webhooks de Mercado Pago (MP Webhook HMAC Validator)
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Implementar un validador de firmas criptográficas para webhooks entrantes de Mercado Pago utilizando `x-signature` y `x-request-id`, previniendo ataques de falsificación y replay attacks.
- **Criterios de Aceptación**:
  - [ ] Función `validateMercadoPagoSignature(headers: { xSignature?: string, xRequestId?: string }, payload: any, secretKey: string): boolean`.
  - [ ] Extracción y validación de `ts` (timestamp) garantizando que el evento no tenga más de 10 minutos de antigüedad.
  - [ ] Función `parseMercadoPagoWebhookEvent(body: any): { eventType: string, action: string, dataId: string } | null`.
  - [ ] Tests en `tests/mp_webhook_crypto.test.ts` con firmas HMAC-SHA256 válidas, firmas adulteradas y expiradas.
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/mpWebhookValidator.ts`
  - Tests a crear: `tests/mp_webhook_crypto.test.ts`
- **Qué NO hacer**:
  - No agregar librerías de hashing externas; utilizar exclusivamente el módulo nativo `crypto` de Node.js.

### TICKET JULES #12: Generador de Metadatos OpenGraph y Schema.org JSON-LD para SEO (Product SEO Metadata Generator)
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Implementar generadores de metadatos SEO enriquecidos para Singles y Cajas Selladas, compatibles con Next.js Metadata y Schema.org `Product` / `Offer`, optimizados para WhatsApp, Twitter y Google.
- **Criterios de Aceptación**:
  - [ ] Función `generateCardJsonLd(card: Card, minListingPriceArs?: number): object` con estructura Schema.org válida.
  - [ ] Función `generateCardMetaTags(card: Card, minListingPriceArs?: number, mepRate?: number): { title: string, description: string, openGraph: any }`.
  - [ ] Función `generateSealedProductJsonLd(product: SealedProduct, minPriceArs?: number): object`.
  - [ ] Tests en `tests/seo_metadata.test.ts` verificando campos requeridos (name, image, offers, priceCurrency: 'ARS', inStock).
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/seoMetadata.ts`
  - Tests a crear: `tests/seo_metadata.test.ts`
  - Referencias: `src/lib/catalog.ts`.
- **Qué NO hacer**:
  - No modificar la cabecera HTML global de la app.

### TICKET JULES #13: Calculadora de Tarifas y Rendimiento Neto del Vendedor (Seller Fee & Net Revenue Calculator)
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Crear una utilidad que calcule con exactitud cuánto dinero neto recibe un vendedor en su cuenta de Mercado Pago por cada venta según el tipo de producto, comisión de plataforma y perfil impositivo fiscal en Argentina.
- **Criterios de Aceptación**:
  - [ ] Soporte para perfiles fiscales: `MONOTRIBUTO`, `RESPONSABLE_INSCRIPTO`, `CONSUMIDOR_FINAL`.
  - [ ] Función `calculateSellerPayout(grossPriceArs: number, taxProfile: TaxProfile, platformFeePercent?: number): SellerPayoutBreakdown`.
  - [ ] Retornar desglose claro: `grossPriceArs`, `platformFeeAmount`, `mpPaymentFeeEstimated`, `estimatedTaxRetention`, `netPayoutAmount`.
  - [ ] Tests unitarios en `tests/seller_payout.test.ts` validando diferentes rangos de precio y categorías fiscales.
- **Contexto del Repo**:
  - Archivo a crear: `src/lib/sellerPayout.ts`
  - Tests a crear: `tests/seller_payout.test.ts`
- **Qué NO hacer**:
  - No guardar datos fiscales sensibles en archivos de código fuente.


