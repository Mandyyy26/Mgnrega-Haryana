# MGNREGA Haryana Backend API

> Enterprise-grade backend API for MGNREGA Haryana performance monitoring platform with Redis caching, PostgreSQL database, and real-time data ingestion.

![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![Express](https://img.shields.io/badge/Express.js-4.18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Redis](https://img.shields.io/badge/Redis-7.0+-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

## 📋 Table of Contents

- [About](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)

## 🎯 About The Project

**MGNREGA Haryana Backend** is a high-performance REST API that provides real-time access to MGNREGA performance data for Haryana districts. It features 50x performance improvement with Redis caching, complex analytics with PostgreSQL, and secure admin endpoints with API key authentication.

## ✨ Features

- ✅ Redis Cache Layer - TTL-based caching (1-24 hours per endpoint)
- ✅ API Rate Limiting - Protect against abuse
- ✅ Request Logging - Complete request/response tracking
- ✅ Error Handling - Graceful error responses
- ✅ CORS Support - Frontend integration ready
- ✅ Data Validation - Input sanitization
- ✅ Admin Dashboard - Cache management
- ✅ Composite Scoring - Multi-metric ranking
- ✅ Geolocation - Auto-detect user's district
- ✅ Performance Tracking - Response monitoring

## 🛠️ Tech Stack

| Layer     | Technology | Version |
| --------- | ---------- | ------- |
| Runtime   | Node.js    | 16+     |
| Framework | Express.js | 4.18+   |
| Language  | TypeScript | 5.0+    |
| Database  | PostgreSQL | 14+     |
| Cache     | Redis      | 7.0+    |
| Logger    | Winston    | 3.8+    |

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js v16 or higher
- npm v7+ or yarn v1.22+
- PostgreSQL 14+ (local or remote)
- Redis 7+ (local or Redis Cloud)
- Git

**Optional:**

- Docker & Docker Compose (for containerization)
- Postman (for API testing)

**Verify installations:**

- node --version # Should be v16+
- npm --version # Should be v7+
- postgres --version # Should be 14+
- redis-cli --version # Should be 7+

## 🚀 Installation

### Step 1: Clone Repository

```
git clone https://github.com/mandyyy26/mgnrega-haryana.git
cd mgnrega-haryana/backend
```

### Step 2: Install Dependencies

```
npm install
```

### Step 3: Setup Environment Variables

Create `.env` file in backend root:

```
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=mgnrega_haryana

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

CACHE_DISTRICTS_TTL=86400
CACHE_RANKINGS_TTL=21600
CACHE_BUDGET_TTL=7200
CACHE_TRENDS_TTL=3600
CACHE_LOCATION_TTL=43200

ADMIN_API_KEY=your-secret-admin-key-here

FRONTEND_URL=http://localhost:3000
```

### Step 4: Setup Database

```
createdb mgnrega_haryana
npm run migrate
npm run seed
```

### Step 5: Start Services

**Terminal 1: Redis**

```
redis-server
```

**Terminal 2: PostgreSQL**

```
postgres
```

**Terminal 3: Backend**

```
npm run dev
```

## 📖 Getting Started

### Test Endpoints

## 🔌 API Endpoints

### Public Endpoints

| Endpoint                          | Method | Purpose               | Cache |
| --------------------------------- | ------ | --------------------- | ----- |
| `/health`                         | GET    | Health check          | No    |
| `/api/v1/districts`               | GET    | All districts         | 24h   |
| `/api/v1/districts/:code/summary` | GET    | District summary      | 2h    |
| `/api/v1/rankings`                | GET    | Top 5 districts       | 6h    |
| `/api/v1/districts/:code/trend`   | GET    | Monthly trends        | 1h    |
| `/api/v1/detect-district`         | GET    | Geolocation detection | 12h   |

### Admin Endpoints (Protected)

| Endpoint                       | Method | Purpose           |
| ------------------------------ | ------ | ----------------- |
| `/api/admin/ingestion-status`  | GET    | Ingestion status  |
| `/api/admin/trigger-ingestion` | POST   | Trigger data sync |
| `/api/admin/cache-stats`       | GET    | Cache statistics  |
| `/api/admin/cache/:key`        | DELETE | Delete cache key  |
| `/api/admin/cache`             | DELETE | Clear all cache   |

### 📋 File Descriptions

#### Core Files

| File                  | Purpose                              |
| --------------------- | ------------------------------------ |
| `src/index.ts`        | Entry point, initializes Express app |
| `src/lib/cache.ts`    | Redis caching service                |
| `src/lib/logger.ts`   | Winston logger configuration         |
| `src/routes/admin.ts` | Protected admin endpoints            |

#### Services Layer

| File                               | Purpose                  |
| ---------------------------------- | ------------------------ |
| `src/services/districtService.ts`  | District data operations |
| `src/services/rankingService.ts`   | Ranking calculations     |
| `src/services/ingestionService.ts` | Data ingestion logic     |

#### Controllers Layer

| File                                    | Purpose                  |
| --------------------------------------- | ------------------------ |
| `src/controllers/districtController.ts` | Handle district requests |
| `src/controllers/rankingController.ts`  | Handle ranking requests  |

#### Utilities

| File                      | Purpose                    |
| ------------------------- | -------------------------- |
| `src/utils/dbPool.ts`     | PostgreSQL connection pool |
| `src/utils/haversine.ts`  | Distance calculation       |
| `src/utils/validators.ts` | Input validation           |

#### Configuration Files

| File                 | Purpose                      |
| -------------------- | ---------------------------- |
| `.env`               | Environment variables        |
| `tsconfig.json`      | TypeScript compiler options  |
| `package.json`       | Dependencies & scripts       |
| `docker-compose.yml` | Docker multi-container setup |

This structure follows **separation of concerns** principle for maintainability and scalability! ✅
