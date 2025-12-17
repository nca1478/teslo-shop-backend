# Teslo Shop Backend

Backend API for Teslo Shop built with NestJS and Hexagonal Architecture.

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) principles:

- **Domain**: Business logic and entities
- **Application**: Use cases and application services
- **Infrastructure**: External adapters (database, external APIs)
- **Presentation**: Controllers and HTTP layer

## 🚀 Features

- ✅ JWT Authentication & Authorization
- ✅ Role-based access control (Admin/User)
- ✅ Product management with pagination and filters
- ✅ Order management system
- ✅ User management
- ✅ PostgreSQL with Prisma ORM
- ✅ Swagger API documentation
- ✅ Docker support
- ✅ Input validation with class-validator
- ✅ Global exception handling

## 🛠️ Tech Stack

- **Framework**: NestJS v10+
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd teslo-backend
npm install
```

### 2. Environment Setup

```bash
cp .env.template .env
# Edit .env with your database credentials
```

### 3. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker-compose up postgres -d

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run start:dev
```

The API will be available at:

- **API**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api/docs

## 🐳 Docker Setup

### Development with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Production Build

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 API Documentation

Once the server is running, visit http://localhost:3001/api/docs for interactive API documentation.

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Product Endpoints

- `GET /api/products` - Get products with filters and pagination
- `GET /api/products/:slug` - Get product by slug
- `POST /api/products` - Create product (Admin only)
- `PATCH /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Order Endpoints

- `POST /api/orders` - Place a new order
- `GET /api/orders/my-orders` - Get current user orders
- `GET /api/orders` - Get all orders with pagination (Admin only)
- `GET /api/orders/:id` - Get order by ID

### User Management Endpoints

- `GET /api/users` - Get all users with pagination (Admin only)
- `PATCH /api/users/:id/role` - Change user role (Admin only)

### Category & Country Endpoints

- `GET /api/categories` - Get all categories
- `GET /api/countries` - Get all countries

### Default Users

After seeding, you can use these accounts:

**Admin User:**

- Email: `admin@teslo.com`
- Password: `123456`

**Regular User:**

- Email: `user@teslo.com`
- Password: `123456`

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Project Structure

```
src/
├── application/          # Application layer
│   ├── use-cases/       # Business use cases
│   ├── ports/           # Interfaces/contracts
│   └── dtos/            # Data transfer objects
├── domain/              # Domain layer
│   ├── entities/        # Domain entities
│   ├── enums/           # Domain enums
│   └── exceptions/      # Domain exceptions
├── infrastructure/      # Infrastructure layer
│   ├── adapters/        # External adapters
│   ├── database/        # Database configuration
│   └── config/          # App configuration
├── presentation/        # Presentation layer
│   └── controllers/     # HTTP controllers
└── shared/              # Shared utilities
    ├── decorators/      # Custom decorators
    ├── guards/          # Auth guards
    └── pipes/           # Validation pipes
```

## 🔧 Available Scripts

```bash
# Development
npm run start:dev        # Start in watch mode
npm run start:debug      # Start in debug mode

# Production
npm run build            # Build the application
npm run start:prod       # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
npm run db:reset         # Reset database

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

## 🌍 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/teslo_shop?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# App
PORT=3001
NODE_ENV=development

# External Services (Optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
