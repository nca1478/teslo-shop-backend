# Teslo Shop — Backend API

API REST para la tienda **Teslo Shop**, construida con **NestJS 11**, **Prisma 7** y **PostgreSQL**, siguiendo **Arquitectura Hexagonal** (Ports & Adapters).

Es el backend del proyecto [teslo-shop-frontend](https://github.com/nca1478/teslo-shop-frontend) (Next.js 15).

---

## Tabla de contenido

- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Modelo de datos](#modelo-de-datos)
- [API REST](#api-rest)
- [Autenticación y autorización](#autenticación-y-autorización)
- [Validación y manejo de errores](#validación-y-manejo-de-errores)
- [Testing](#testing)
- [Scripts disponibles](#scripts-disponibles)
- [Scripts utilitarios](#scripts-utilitarios)
- [Despliegue](#despliegue)
- [Solución de problemas](#solución-de-problemas)

---

## Stack tecnológico

| Área              | Tecnología                                         |
| ----------------- | -------------------------------------------------- |
| Framework         | NestJS 11                                          |
| Lenguaje          | TypeScript 5.7                                     |
| Base de datos     | PostgreSQL 15                                      |
| ORM               | Prisma 7 (driver adapter `@prisma/adapter-pg`)     |
| Autenticación     | JWT (`@nestjs/jwt` + Passport) y bcryptjs          |
| Validación        | class-validator + class-transformer                |
| Documentación     | Swagger / OpenAPI (`@nestjs/swagger`)              |
| Almacenamiento    | Cloudinary (imágenes de productos)                 |
| Pagos             | PayPal REST API                                    |
| Testing           | Jest + Supertest                                   |
| Infraestructura   | Docker Compose (PostgreSQL)                        |

---

## Arquitectura

El proyecto aplica **Arquitectura Hexagonal**: el dominio y los casos de uso no conocen a NestJS, Prisma ni HTTP. Toda dependencia externa se declara como una **interfaz (puerto)** en `application/ports` y se resuelve con un **adaptador** en `infrastructure/adapters`, inyectado por token desde `app.module.ts`.

```
        HTTP (Controllers)
                │
                ▼
   ┌────────────────────────┐
   │      APPLICATION       │   Casos de uso + DTOs + Puertos (interfaces)
   │  (orquesta el dominio) │
   └───────────┬────────────┘
               │ depende de ▼ (solo interfaces)
   ┌────────────────────────┐
   │        DOMAIN          │   Entidades, enums, value objects, excepciones
   │  (sin dependencias)    │
   └────────────────────────┘
               ▲ implementa los puertos
   ┌───────────┴────────────┐
   │    INFRASTRUCTURE      │   Prisma, JWT, Cloudinary, PayPal, filtros
   └────────────────────────┘
```

**Capas:**

- **Domain** — Entidades (`User`, `Product`, `Order`, `Category`, `Country`, `Address`), enums (`Role`, `Gender`, `Size`), value objects y excepciones de dominio. Sin dependencias externas.
- **Application** — Casos de uso (una clase por operación), DTOs de entrada validados y puertos (`ports/repositories`, `ports/services`, `ports/external`).
- **Infrastructure** — Repositorios Prisma, `JwtAuthService`, `JwtStrategy`, guards, adaptadores de Cloudinary y PayPal, filtro global de excepciones, interceptor de logging y configuración.
- **Presentation** — 9 controladores REST. Solo traducen HTTP ↔ casos de uso.

La inyección se hace mediante tokens definidos en `src/shared/constants/injection-tokens.ts`, lo que permite sustituir un adaptador (p. ej. Prisma por otro ORM) sin tocar la lógica de negocio.

---

## Estructura del proyecto

```
backend/
├── prisma/
│   ├── data/                    # Datos del seed (users, categories, countries, products)
│   ├── migrations/              # Migraciones SQL generadas por Prisma
│   ├── schema.prisma            # Esquema de la base de datos
│   └── seed.ts                  # Seed idempotente (upsert)
├── scripts/                     # Utilidades de diagnóstico (ver más abajo)
├── src/
│   ├── application/
│   │   ├── dtos/                # auth, products, orders, users, common
│   │   ├── ports/               # repositories, services, external
│   │   └── use-cases/           # addresses, auth, categories, countries,
│   │                            # orders, payments, products, users
│   ├── domain/
│   │   ├── entities/            # Entidades de negocio
│   │   ├── enums/               # Role, Gender, Size
│   │   ├── exceptions/          # ValidationDomainException, NotFoundDomainException
│   │   └── value-objects/       # Email, Password, Price
│   ├── infrastructure/
│   │   ├── adapters/
│   │   │   ├── auth/            # JwtAuthService, JwtStrategy, guards
│   │   │   ├── external/        # PayPalAdapter, CloudinaryAdapter
│   │   │   └── repositories/    # Repositorios Prisma
│   │   ├── common/              # filters, interceptors, pipes
│   │   ├── config/              # database.config, jwt.config
│   │   └── database/            # PrismaService
│   ├── presentation/
│   │   └── controllers/         # 9 controladores REST
│   ├── shared/
│   │   ├── constants/           # INJECTION_TOKENS
│   │   └── decorators/          # @Roles, @GetUser
│   ├── app.module.ts            # Composición de dependencias
│   └── main.ts                  # Bootstrap: CORS, prefijo /api, Swagger, pipes
├── test/                        # Tests e2e (app, auth, products)
├── docker-compose.yml           # PostgreSQL
└── .env.template
```

---

## Requisitos previos

- **Node.js 18+** (recomendado 20+)
- **PostgreSQL 15+** — o Docker para levantarlo con `docker-compose`
- Cuentas de **Cloudinary** y **PayPal Sandbox** (opcionales; solo para subida de imágenes y pagos)

---

## Puesta en marcha

### 1. Instalar dependencias

```bash
git clone https://github.com/nca1478/teslo-shop-backend.git
cd teslo-shop-backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.template .env
```

Edita `.env` con tus credenciales (ver [Variables de entorno](#variables-de-entorno)).

### 3. Levantar PostgreSQL

```bash
docker compose up -d
```

Esto arranca el contenedor `teslo-postgres` exponiendo el puerto **5433** del host hacia el 5432 del contenedor. Ajusta `DATABASE_URL` en consecuencia.

> Si ya tienes un PostgreSQL propio, omite este paso y apunta `DATABASE_URL` a tu instancia.

### 4. Preparar la base de datos

```bash
npm run db:setup
```

Este único comando ejecuta: `prisma generate` → `prisma migrate dev` → `prisma seed`.

### 5. Arrancar en desarrollo

```bash
npm run start:dev
```

| Recurso        | URL                                |
| -------------- | ---------------------------------- |
| API            | http://localhost:3001/api          |
| Swagger UI     | http://localhost:3001/api/docs     |
| Health check   | http://localhost:3001/api/health   |

> Swagger solo se expone cuando `NODE_ENV !== 'production'`.

### Usuarios del seed

| Email             | Contraseña | Rol     |
| ----------------- | ---------- | ------- |
| `admin@teslo.com` | `123456`   | `admin` |
| `user@teslo.com`  | `123456`   | `user`  |

---

## Variables de entorno

| Variable                 | Requerida | Descripción                                                                |
| ------------------------ | :-------: | -------------------------------------------------------------------------- |
| `DATABASE_URL`           |     ✅    | Cadena de conexión PostgreSQL usada por Prisma y por el pool `pg`.          |
| `POSTGRES_DB`            |     ⚙️    | Nombre de la BD para el contenedor de `docker-compose`.                     |
| `POSTGRES_USER`          |     ⚙️    | Usuario para el contenedor de `docker-compose`.                             |
| `POSTGRES_PASSWORD`      |     ⚙️    | Contraseña para el contenedor de `docker-compose`.                          |
| `DIRECT_URL`             |     ❌    | Conexión directa (sin pooler) que el CLI de Prisma usa para migraciones.    |
| `JWT_SECRET`             |     ✅    | Clave de firma de los JWT. **Cámbiala en producción.**                      |
| `JWT_EXPIRES_IN`         |     ❌    | Vigencia del token (por defecto `24h`).                                     |
| `PORT`                   |     ❌    | Puerto HTTP (por defecto `3001`).                                           |
| `NODE_ENV`               |     ❌    | `development` \| `production`. Controla logs, CORS y Swagger.               |
| `FRONTEND_URL`           |     ⚙️    | Origen permitido por CORS **en producción**.                                |
| `CLOUDINARY_CLOUD_NAME`  |     ❌    | Credenciales de Cloudinary.                                                 |
| `CLOUDINARY_API_KEY`     |     ❌    | Credenciales de Cloudinary.                                                 |
| `CLOUDINARY_API_SECRET`  |     ❌    | Credenciales de Cloudinary.                                                 |
| `CLOUDINARY_FOLDER`      |     ❌    | Carpeta destino de las imágenes.                                            |
| `PAYPAL_CLIENT_ID`       |     ❌    | Credenciales de PayPal.                                                     |
| `PAYPAL_CLIENT_SECRET`   |     ❌    | Credenciales de PayPal.                                                     |
| `PAYPAL_OAUTH_URL`       |     ❌    | Endpoint OAuth (sandbox: `https://api-m.sandbox.paypal.com/v1/oauth2/token`).|
| `PAYPAL_ORDERS_URL`      |     ❌    | Endpoint de órdenes (sandbox: `https://api.sandbox.paypal.com/v2/checkout/orders`). |
| `PAYPAL_MOCK_PAYMENTS`   |     ❌    | `true` para simular pagos aprobados sin llamar a PayPal (solo desarrollo).   |

Ejemplo mínimo para desarrollo local:

```bash
DATABASE_URL="postgresql://postgres:secret@localhost:5433/teslo_shop_db?schema=public&sslmode=disable"
POSTGRES_DB=teslo_shop_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret

JWT_SECRET=cambia-esta-clave
JWT_EXPIRES_IN=24h

PORT=3001
NODE_ENV=development
```

> `.env` está en `.gitignore`. Nunca subas credenciales al repositorio.

---

## Base de datos

### Comandos habituales

```bash
npm run prisma:generate   # Regenerar el cliente Prisma tras editar el schema
npm run prisma:migrate    # Crear y aplicar una migración (desarrollo)
npm run prisma:deploy     # Aplicar migraciones existentes (producción/CI)
npm run prisma:seed       # Poblar la BD (idempotente, usa upsert)
npm run prisma:studio     # Explorador visual de datos
npm run prisma:reset      # ⚠️ Borra la BD y reaplica migraciones + seed
```

### Notas de configuración

- `PrismaService` usa el **driver adapter** `@prisma/adapter-pg` sobre un `Pool` de `pg`, en lugar del motor por defecto.
- `prisma.config.js` prioriza `DIRECT_URL` sobre `DATABASE_URL` para las operaciones del CLI: útil cuando la app se conecta a través de un pooler (PgBouncer, Supabase, Neon) pero las migraciones necesitan conexión directa.
- El seed es **idempotente**: puedes ejecutarlo varias veces sin duplicar registros.

---

## Modelo de datos

```
Category 1───N Product 1───N ProductImage
                  │
                  └───N OrderItem N───1 Order
                                          │
User 1───N Order ─────────────────────────┘
 │                       │
 │                       └── 1───1 OrderAddress N───1 Country
 └── 1───1 UserAddress N───1 Country
```

| Modelo         | Tabla            | Notas                                                              |
| -------------- | ---------------- | ------------------------------------------------------------------ |
| `Category`     | `category`       | `name` único.                                                      |
| `Product`      | `product`        | `slug` único, índice por `gender`, arrays `sizes` y `tags`.         |
| `ProductImage` | `product_image`  | `onDelete: Cascade` desde `Product`.                                |
| `User`         | `user`           | `email` único, `role` (`admin`/`user`), password hasheada (bcrypt). |
| `Country`      | `country`        | ID de tipo string (código ISO).                                     |
| `UserAddress`  | `user_address`   | Relación 1:1 con `User`.                                            |
| `Order`        | `order`          | `isPaid`, `paidAt`, `transactionId`, totales e items.               |
| `OrderItem`    | `order_item`     | `onDelete: Restrict` sobre `Product` (protege el histórico).        |
| `OrderAddress` | `order_address`  | Snapshot de la dirección al momento de la compra (1:1 con `Order`). |

**Enums:** `Size` (`XS`…`XXXL`), `Gender` (`men`, `women`, `kids`, `unisex`), `Role` (`admin`, `user`).

---

## API REST

Todos los endpoints cuelgan del prefijo global **`/api`**.

**Leyenda de acceso:** 🌐 público · 🔒 requiere JWT · 👑 requiere rol `admin`

### Auth — `/api/auth`

| Método | Ruta        | Acceso | Descripción                                    |
| ------ | ----------- | :----: | ---------------------------------------------- |
| `POST` | `/login`    |   🌐   | Inicia sesión. Devuelve `{ user, token }`.     |
| `POST` | `/register` |   🌐   | Registra un usuario con rol `user` y lo loguea.|

### Products — `/api/products`

| Método   | Ruta           | Acceso | Descripción                                    |
| -------- | -------------- | :----: | ---------------------------------------------- |
| `GET`    | `/`            |   🌐   | Listado paginado con filtros y ordenamiento.   |
| `GET`    | `/search`      |   🌐   | Búsqueda por título.                           |
| `GET`    | `/:slug`       |   🌐   | Detalle de producto por slug.                  |
| `POST`   | `/`            |   👑   | Crea un producto.                              |
| `PATCH`  | `/:id`         |   👑   | Actualiza un producto.                         |
| `DELETE` | `/:id/images`  |   👑   | Elimina una imagen (`{ imageUrl }` en el body).|
| `DELETE` | `/:id`         |   👑   | Elimina un producto.                           |

**Query params de `GET /api/products`:**

| Param       | Tipo   | Por defecto | Valores                                        |
| ----------- | ------ | ----------- | ---------------------------------------------- |
| `page`      | number | `1`         | ≥ 1                                            |
| `limit`     | number | `12`        | ≥ 1                                            |
| `gender`    | string | —           | `men` \| `women` \| `kids` \| `unisex`         |
| `category`  | string | —           | Nombre o id de categoría                       |
| `search`    | string | —           | Término de búsqueda                            |
| `sortBy`    | string | `title`     | `title` \| `price` \| `createdAt` \| `stock`   |
| `sortOrder` | string | `asc`       | `asc` \| `desc`                                |

**Query params de `GET /api/products/search`:** `q` (término), `page` (por defecto `1`), `limit` (por defecto `10`, máx. `50`).

### Orders — `/api/orders` (todo el controlador requiere JWT)

| Método | Ruta         | Acceso | Descripción                                     |
| ------ | ------------ | :----: | ----------------------------------------------- |
| `POST` | `/`          |   🔒   | Crea una orden con items y dirección de envío.  |
| `GET`  | `/my-orders` |   🔒   | Órdenes del usuario autenticado.                |
| `GET`  | `/`          |   👑   | Todas las órdenes, paginadas (`page`, `limit`). |
| `GET`  | `/:id`       |   🔒   | Detalle de una orden.                           |

### Users — `/api/users`

| Método  | Ruta          | Acceso | Descripción                                        |
| ------- | ------------- | :----: | -------------------------------------------------- |
| `GET`   | `/profile`    |   🔒   | Perfil del usuario autenticado.                    |
| `PATCH` | `/profile`    |   🔒   | Actualiza nombre, email, password o imagen.        |
| `GET`   | `/`           |   👑   | Listado paginado de usuarios (`page`, `limit`).    |
| `PATCH` | `/:id/role`   |   👑   | Cambia el rol (`{ role: "admin" \| "user" }`).     |

### Addresses — `/api/addresses` (todo el controlador requiere JWT)

| Método   | Ruta | Acceso | Descripción                                     |
| -------- | ---- | :----: | ----------------------------------------------- |
| `GET`    | `/`  |   🔒   | Dirección guardada del usuario.                 |
| `POST`   | `/`  |   🔒   | Crea o reemplaza la dirección del usuario.      |
| `DELETE` | `/`  |   🔒   | Elimina la dirección del usuario.               |

### Payments — `/api/payments` (todo el controlador requiere JWT)

| Método | Ruta                 | Acceso | Descripción                                                 |
| ------ | -------------------- | :----: | ----------------------------------------------------------- |
| `POST` | `/set-transaction-id`|   🔒   | Asocia el id de transacción de PayPal a una orden.          |
| `POST` | `/paypal/check`      |   🔒   | Verifica el pago contra PayPal y marca la orden como pagada.|

### Catálogos y estado

| Método | Ruta              | Acceso | Descripción                                    |
| ------ | ----------------- | :----: | ---------------------------------------------- |
| `GET`  | `/api/categories` |   🌐   | Todas las categorías.                          |
| `GET`  | `/api/countries`  |   🌐   | Todos los países.                              |
| `GET`  | `/api/health`     |   🌐   | Estado del servicio y de la conexión a la BD.  |

### Ejemplos

**Login**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teslo.com","password":"123456"}'
```

```json
{
    "user": {
        "id": "uuid",
        "email": "admin@teslo.com",
        "name": "Admin",
        "roles": ["admin"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Listar productos con filtros**

```bash
curl "http://localhost:3001/api/products?gender=men&page=1&limit=12&sortBy=price&sortOrder=desc"
```

```json
{
    "products": [ /* ... */ ],
    "total": 42,
    "page": 1,
    "limit": 12,
    "totalPages": 4
}
```

**Endpoint protegido**

```bash
curl http://localhost:3001/api/orders/my-orders \
  -H "Authorization: Bearer <token>"
```

**Crear producto (admin)**

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer <token-admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Men's Chill Crew Neck Sweatshirt",
    "description": "Sudadera cómoda de cuello redondo",
    "price": 75,
    "slug": "mens_chill_crew_neck_sweatshirt",
    "stock": 10,
    "sizes": ["S", "M", "L"],
    "gender": "men",
    "tags": ["sweatshirt"],
    "images": ["https://res.cloudinary.com/.../img.jpg"],
    "categoryId": "uuid-categoria"
  }'
```

> Las imágenes se suben a Cloudinary desde el frontend; la API recibe únicamente las URLs resultantes.

---

## Autenticación y autorización

1. `POST /api/auth/login` valida credenciales con bcrypt y firma un JWT (`{ id, email, roles }`) con `JWT_SECRET`, vigente `JWT_EXPIRES_IN` (24 h por defecto).
2. El cliente envía el token en la cabecera `Authorization: Bearer <token>`.
3. `JwtStrategy` lo extrae, verifica la firma y **recarga el usuario desde la base de datos**; rechaza el acceso si no existe o está inactivo. Así, revocar un usuario surte efecto de inmediato sin esperar a que expire el token.
4. `JwtAuthGuard` protege las rutas autenticadas; `RolesGuard` + el decorador `@Roles(Role.ADMIN)` restringen las de administración.
5. El decorador `@GetUser()` inyecta la entidad `User` ya resuelta en el controlador.

**CORS:** en desarrollo se aceptan todos los orígenes; en producción solo el definido en `FRONTEND_URL`. Se habilita `credentials: true` y se expone la cabecera `Authorization`.

En Swagger UI, usa el botón **Authorize** para pegar el token y probar los endpoints protegidos.

---

## Validación y manejo de errores

Un `ValidationPipe` global aplica:

- `whitelist: true` — descarta propiedades no declaradas en el DTO.
- `forbidNonWhitelisted: true` — **rechaza** la petición si llegan campos desconocidos.
- `transform` + `enableImplicitConversion` — convierte tipos automáticamente (por ejemplo, query params string → number).

El `HttpExceptionFilter` global traduce las excepciones de dominio a códigos HTTP y normaliza la respuesta:

| Excepción                   | HTTP  |
| --------------------------- | ----- |
| `ValidationDomainException` | `400` |
| `NotFoundDomainException`   | `404` |
| `HttpException` (Nest)      | su propio status |
| Cualquier otro `Error`      | `500` |

```json
{
    "statusCode": 404,
    "message": "Product not found",
    "timestamp": "2025-01-15T10:30:00.000Z"
}
```

Un `LoggingInterceptor` global registra cada petición entrante.

---

## Testing

```bash
npm run test          # Tests unitarios (*.spec.ts dentro de src/)
npm run test:watch    # Modo watch
npm run test:cov      # Reporte de cobertura → ./coverage
npm run test:e2e      # Tests end-to-end (carpeta test/)
npm run test:debug    # Depuración con --inspect-brk
```

- **Unitarios** (`src/**/*.spec.ts`): casos de uso con repositorios y servicios mockeados — `login`, `place-order`, `create-product`.
- **E2E** (`test/*.e2e-spec.ts`): `app`, `auth` y `products` levantando la aplicación con Supertest.

> Los tests e2e usan la base de datos configurada en `.env`. Apunta `DATABASE_URL` a una BD de pruebas para no ensuciar tus datos de desarrollo.

---

## Scripts disponibles

| Script                   | Descripción                                              |
| ------------------------ | -------------------------------------------------------- |
| `npm run start:dev`      | Servidor en modo watch.                                  |
| `npm run start:debug`    | Modo watch con depurador.                                |
| `npm run build`          | Compila a `dist/`.                                       |
| `npm run start:prod`     | Ejecuta `node dist/src/main` (requiere `build` previo).   |
| `npm run lint`           | ESLint con `--fix`.                                      |
| `npm run format`         | Prettier sobre `src/` y `test/`.                         |
| `npm run db:setup`       | `prisma:generate` + `prisma:migrate` + `prisma:seed`.    |
| `npm run db:deploy`      | `prisma:generate` + `prisma:deploy` + `prisma:seed`.     |

Los comandos de Prisma están listados en [Base de datos](#base-de-datos).

---

## Scripts utilitarios

Utilidades sueltas en `scripts/`, pensadas para diagnóstico manual en desarrollo. Se ejecutan con Node y leen la configuración de `.env`:

| Archivo                        | Para qué sirve                                            |
| ------------------------------ | --------------------------------------------------------- |
| `check-orders.js`              | Inspecciona órdenes con sus relaciones cargadas.           |
| `simple-check-orders.js`       | Versión reducida del anterior.                             |
| `generate-test-transactions.js`| Genera transacciones de prueba.                            |
| `simulate-paypal-payment.js`   | Simula el flujo de pago de PayPal contra el sandbox.        |

```bash
node scripts/check-orders.js
```

---

## Despliegue

### 1. Compilar

```bash
npm ci
npm run build
```

### 2. Preparar la base de datos

```bash
npm run db:deploy
```

Usa `prisma migrate deploy` (aplica migraciones sin generarlas), que es lo correcto en producción.

### 3. Arrancar

```bash
NODE_ENV=production npm run start:prod
```

**Checklist antes de publicar:**

- [ ] `JWT_SECRET` con un valor fuerte y distinto al de desarrollo.
- [ ] `NODE_ENV=production` — desactiva Swagger, reduce logs y restringe CORS.
- [ ] `FRONTEND_URL` apuntando al dominio real del frontend.
- [ ] `PAYPAL_MOCK_PAYMENTS` ausente o distinto de `true`.
- [ ] `DATABASE_URL` (y `DIRECT_URL` si usas un pooler) correctamente configuradas.

> `docker-compose.yml` solo define el servicio de PostgreSQL para desarrollo local; no incluye la aplicación.

---

## Solución de problemas

| Síntoma                                              | Causa probable y solución                                                                                   |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `Can't reach database server`                        | El contenedor no está arriba o el puerto no coincide. `docker compose up -d` y revisa que `DATABASE_URL` use el **5433**. |
| `@prisma/client did not initialize yet`              | Falta generar el cliente: `npm run prisma:generate`.                                                          |
| `400 Bad Request` con `property X should not exist`  | `forbidNonWhitelisted` está activo: el body incluye campos fuera del DTO.                                     |
| `401 Unauthorized` en rutas protegidas               | Falta la cabecera `Authorization: Bearer <token>`, o el token expiró / el `JWT_SECRET` cambió.                |
| `403 Forbidden`                                      | La ruta exige rol `admin`; autentícate con `admin@teslo.com`.                                                 |
| Bloqueo por CORS desde el frontend                   | En producción, `FRONTEND_URL` debe coincidir exactamente con el origen del navegador.                         |
| Swagger devuelve 404                                 | `NODE_ENV` está en `production`; Swagger solo se monta fuera de producción.                                   |
| El seed duplica o falla                              | Es idempotente por diseño; si el esquema cambió, ejecuta `npm run prisma:reset` (⚠️ borra los datos).          |

---

## Proyectos relacionados

- **Frontend:** [teslo-shop-frontend](https://github.com/nca1478/teslo-shop-frontend) — Next.js 15 + Tailwind CSS 4.

---

## Licencia

Proyecto privado con fines educativos y de portafolio (`UNLICENSED`).
