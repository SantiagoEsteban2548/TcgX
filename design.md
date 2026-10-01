# tcgtX — Design System & Brand Kit

Este documento es la **fuente de verdad visual y de diseño** para **tcgtX**, marketplace de compra-venta de cartas de One Piece TCG para Argentina y LatAm.

---

## 1. Filosofía de Diseño y Estilo
- **Estilo**: Profesional, moderno, confiable y enfocado en producto coleccionable / trading fintech.
- **Atmósfera**: Náutica refinada (One Piece / Grand Line) pero manteniendo la sobriedad y transparencia de un broker/marketplace financiero de alta gama (similar a TCGplayer Pro / Robinhood / Cardmarket).
- **Modos**: Soporte nativo para **Light Mode** y **Dark Mode** con persistencia automática y toggle de usuario.

---

## 2. Paleta de Colores (Color Tokens)

### 2.1 Colores Principales (Brand Blues & Whites)
| Token | HEX | Uso / Semántica |
| :--- | :--- | :--- |
| `ocean-950` | `#0A1128` | Fondo principal en Dark Mode profundo / headers oscuros. |
| `ocean-900` | `#0F1E36` | Superficie de tarjetas (cards) y modales en Dark Mode. |
| `ocean-800` | `#1B2A4A` | Bordes y divisores sutiles en Dark Mode. |
| `blue-primary` | `#1D4ED8` (Royal Blue) | Botones primarios, call-to-actions clave, links activos. |
| `azure-accent` | `#0284C7` (Sky/Azure) | Hover states, acentos dinámicos, tabs seleccionadas. |
| `celeste-light` | `#38BDF8` (Cyan/Celeste) | Highlights, badges de verificación, precios TCGplayer en Dark. |
| `ice-50` | `#F0F9FF` (Ice Blue) | Fondo de acento y hover en Light Mode. |
| `slate-50` | `#F8FAFC` | Fondo de página en Light Mode (off-white limpio, no encandila). |
| `pure-white` | `#FFFFFF` | Superficie de tarjetas y contenedores en Light Mode. |

### 2.2 Colores Funcionales & Financieros
| Token | HEX | Significado |
| :--- | :--- | :--- |
| `mep-green` | `#10B981` (Emerald) | Cotización Dólar MEP, precio por debajo de mediana TCGplayer ("Buena oferta"). |
| `blue-rate` | `#0284C7` (Cyan) | Cotización Dólar Blue, badges de conversión. |
| `median-gold` | `#F59E0B` (Amber) | Mediana TCGplayer (referencia obligatoria de lanzamiento). |
| `market-purple`| `#8B5CF6` (Violet) | Precio de Mercado TCGplayer. |
| `danger-red` | `#EF4444` (Rose) | Alertas, cartas con daño severo, errores de pago. |

### 2.3 Badges de Estado / Condición de Cartas (TCG Grading Standard)
| Condición | Código | Color Fondo | Color Texto |
| :--- | :--- | :--- | :--- |
| **Near Mint** | `NM` | `bg-emerald-500/10` | `text-emerald-600 dark:text-emerald-400` |
| **Lightly Played** | `LP` | `bg-sky-500/10` | `text-sky-600 dark:text-sky-400` |
| **Moderately Played** | `MP` | `bg-amber-500/10` | `text-amber-600 dark:text-amber-400` |
| **Heavily Played** | `HP` | `bg-orange-500/10` | `text-orange-600 dark:text-orange-400` |
| **Damaged** | `DMG` | `bg-rose-500/10` | `text-rose-600 dark:text-rose-400` |

### 2.4 Tipos de Producto Sellado
- **Booster Box** (Caja de 24 sobres)
- **Booster Pack** (Sobre individual)
- **Starter Deck** (Mazo inicial)
- **Double Pack** / **Premium Collection**
- **Accesorios / Sleeves oficiales**

---

## 3. Tipografía
- **Fuente Principal**: `Geist Sans` / `Inter`, system fallbacks (`sans-serif`).
- **Números y Precios**: `Geist Mono` o números tabulares (`font-mono tracking-tight`) para que las tablas de precios de MEP, Blue y TCGplayer no tengan saltos visuales al actualizarse.

---

## 4. Componentes UI Específicos

### 4.1 Card Listing Display (Tarjeta de Producto)
- **Imagen**: Proporción 1:1.4 (estándar cartas TCG) con esquinas redondeadas (`rounded-xl`), borde sutil (`border border-slate-200 dark:border-slate-800`), sombra suave (`shadow-sm hover:shadow-md transition-all`).
- **Header**: Código de carta (`OP01-025`), rareza (`SR`, `SEC`, `L`, etc.) y set (`Romance Dawn`).
- **Pricing Bar**:
  - Precio Vendedor (ARS): destacado en texto grande negrita (`text-xl font-bold`).
  - Referencia TCGplayer: Mediana en USD convertida a ARS MEP y Blue.
  - Indicador de Deal: Si el precio publicado está ≤ 95% de la mediana, mostrar badge *"🔥 Bajo mediana"*.
- **Vendedor**: Alias, avatar, y badge de reputación/ventas realizadas.

### 4.2 Ticker de Divisas (Header Bar)
- En el header superior (sticky):
  - `Dólar MEP: $1.548,70`
  - `Dólar Blue: $1.560,00`
  - `TCGplayer Sync: Hoy 03:00`
- Con opción de alternar la vista por defecto en todo el catálogo entre **ARS (MEP)** o **ARS (Blue)** con un solo click.

---

## 5. Accesibilidad y Estándares
- Contraste mínimo WCAG AA (4.5:1) en todos los textos sobre fondos claros y oscuros.
- Focus rings visibles con `focus-visible:ring-2 focus-visible:ring-blue-500`.
- Soporte completo para lectores de pantalla en precios y estados de stock.
