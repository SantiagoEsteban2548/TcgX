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
