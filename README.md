# tcgtX — Marketplace de One Piece TCG

**tcgtX** es un marketplace de compra-venta de cartas de One Piece TCG (singles y producto sellado) diseñado específicamente para el mercado de Argentina y LatAm.

Integra precios de referencia oficiales de **TCGplayer** (mediana obligatoria de lanzamiento y mercado) y conversión automática a **Pesos Argentinos (ARS)** calculada en tiempo real mediante las cotizaciones de **Dólar MEP** y **Dólar Blue**.

---

## 🚀 Características Principales

1. **Catálogo Especializado One Piece TCG**:
   - Soporte para **Singles** (códigos de carta oficiales OP01, ST01, etc., rarezas C, UC, R, SR, SEC, L, SP, AA, y condiciones de conservación NM, LP, MP, HP, DMG).
   - Soporte para **Producto Sellado** (Booster Boxes, Booster Packs, Starter Decks, Premium Collections, Sleeves).
2. **Precios de Referencia TCGplayer**:
   - Almacenamiento histórico de precios (mediana y mercado).
   - Indicadores visuales automáticos cuando una publicación se encuentra por debajo de la mediana del mercado internacional.
3. **Conversión de Divisas en Vivo (MEP & Blue)**:
   - Integración con cotizaciones argentinas en tiempo real vía `DolarApi`.
   - Congelamiento del tipo de cambio exacto al momento de generar la orden de compra.
4. **Cobros y Pagos con Mercado Pago Marketplace**:
   - Integración mediante **OAuth 2.0 y Split de Pagos** (`marketplace_fee`).
   - El comprador paga en ARS, el vendedor recibe sus fondos netos directamente en su cuenta de MP y la plataforma retiene su comisión automáticamente.
   - El proceso de KYC (verificación de identidad, CUIT y cuenta bancaria) queda delegado y garantizado por Mercado Pago.
5. **Cuentas y Colección Personal**:
   - Perfil de usuario con reputación e historial.
   - Registro de colección personal (wishlist / posesión) completamente desacoplado del inventario publicado para la venta.
6. **Diseño Profesional**:
   - Soporte nativo para **Light Mode** y **Dark Mode**.
   - Paleta náutica corporativa (azules marinos, celestes, blancos limpios y acentos financieros). Ver detalles en [`design.md`](./design.md).

---

## 🛠️ Stack Tecnológico

- **Frontend & Backend**: Next.js 15+ (App Router, React 19, TypeScript).
- **Estilos**: Tailwind CSS v4.
- **Base de Datos & ORM**: PostgreSQL con Prisma ORM.
- **Testing**: Vitest para tests unitarios y de integración de lógica crítica (precios, divisas, pagos).
- **Control de Calidad**: ESLint y TypeScript en modo estricto.

---

## 📋 Variables de Entorno

Crear un archivo `.env` o `.env.local` en la raíz del proyecto basándose en [`.env.example`](./.env.example):

```env
# Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Base de datos PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/tcgtx?schema=public"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto_generado

# Mercado Pago (Modo Sandbox obligatorio durante desarrollo)
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx
MERCADOPAGO_CLIENT_ID=tu_client_id
MERCADOPAGO_CLIENT_SECRET=tu_client_secret

# Cotizaciones de Moneda
DOLAR_API_BASE_URL=https://dolarapi.com/v1
```

---

## 💻 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev

# Ejecutar tests automatizados
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Compilar para producción
npm run build
```

---

## 🏛️ Decisiones de Arquitectura (ADR)

Consulte [`AGENTS.md`](./AGENTS.md) para conocer las pautas de arquitectura, reglas de delegación y estándares de desarrollo para agentes y colaboradores.
Consulte [`design.md`](./design.md) para especificaciones completas del sistema de diseño y Brand Kit.
