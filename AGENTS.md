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
- **Estado**: `[PENDIENTE]`
- **Objetivo**: Extender `CardFilters` en `src/lib/catalog.ts` para permitir rangos numéricos de filtro: costo mínimo/máximo, poder mínimo/máximo y valor de contraataque (Counter 1000/2000).
- **Criterios de Aceptación**:
  - [ ] Soporte para `minCost`, `maxCost`, `minPower`, `maxPower`, `counter` en `CardFilters` y `getCards()`.
  - [ ] Tests unitarios en `tests/catalog.test.ts` verificando filtros combinados (ej: cartas rojas con costo <= 3 y power >= 5000).
- **Contexto del Repo**:
  - Archivos a modificar: `src/lib/catalog.ts`, `tests/catalog.test.ts`.
- **Qué NO hacer**:
  - No romper los filtros existentes (`query`, `setCode`, `rarity`, `color`, `type`).
