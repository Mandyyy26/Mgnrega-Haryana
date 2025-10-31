# MGNREGA Haryana Platform

> Real-time performance monitoring and analytics for MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) across all Haryana districts. Built with React, Node.js, PostgreSQL, and Redis.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Mission

Empower government officials and policymakers with **real-time, data-driven insights** into MGNREGA performance across Haryana districts, enabling faster decision-making and improved rural employment outcomes.

## 📊 What It Does

Track and analyze MGNREGA performance metrics including:

- Monthly performance data for all 22

## 🔑 Key Features

- ✅ **Real-time Dashboard** - Live KPIs and rankings
- ✅ **Performance Analytics** - Trend analysis with charts
- ✅ **Geolocation Detection** - Auto-detect user's district
- ✅ **Bilingual UI** - English & Hindi support
- ✅ **Redis Caching** - 50x faster response times
- ✅ **Automated Ingestion** - Monthly data sync from Gov API
- ✅ **Admin Panel** - Cache management & monitoring
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Production Ready** - Scalable architecture

## 🛠️ Tech Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Frontend       | React 18, TypeScript, Tailwind CSS, Vite |
| Backend        | Node.js, Express.js, PostgreSQL          |
| Cache          | Redis                                    |
| Data Ingestion | Node.js, Cron Jobs                       |
| Logging        | Winston                                  |
| Deployment     | Railway, Vercel, Docker                  |

## 📊 API Endpoints

| Method | Endpoint                          | Purpose          |
| ------ | --------------------------------- | ---------------- |
| GET    | `/api/v1/districts`               | All districts    |
| GET    | `/api/v1/districts/:code/summary` | District metrics |
| GET    | `/api/v1/rankings`                | Top 5 districts  |
| GET    | `/api/v1/districts/:code/trend`   | Monthly trends   |
| GET    | `/api/v1/detect-district`         | Geolocation      |

See [Backend README](./backend/README.md) for full API documentation.

## 🚢 Deployment

### Frontend (Vercel)

Haryana districts

- Person-days generated and wage rates
- District rankings and comparative analysis
- Geolocation-based district detection
- Bilingual interface (English & Hindi)
- Interactive trend charts and KPI dashboards

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- PostgreSQL 14+
- Redis 7+
- Git

### Setup (5 minutes)

Clone Repository

```
git clone https://github.com/mandyyy26/mgnrega-haryana.git
cd mgnrega-haryana
```

Install & configure services

```
cd backend && npm install
cd ../frontend && npm install
cd ../data-ingester && npm install
```

Setup environment files

```
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp data-ingester/.env.example data-ingester/.env
```

**Start all services**

Terminal 1: Redis

```
redis-server
```

Terminal 2: Backend

```
cd backend && npm run dev

```

Terminal 3: Frontend

```
cd frontend && npm run dev
```

Terminal 4: Data Ingester (optional)

```
cd data-ingester && npm run dev
```

Visit `http://localhost:3000` in your browser.

## 🔑 Key Features

- ✅ **Real-time Dashboard** - Live KPIs and rankings
- ✅ **Performance Analytics** - Trend analysis with charts
- ✅ **Geolocation Detection** - Auto-detect user's district
- ✅ **Bilingual UI** - English & Hindi support
- ✅ **Redis Caching** - 50x faster response times
- ✅ **Automated Ingestion** - Monthly data sync from Gov API
- ✅ **Admin Panel** - Cache management & monitoring
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Production Ready** - Scalable architecture

## 🛠️ Tech Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Frontend       | NEXT.js , TypeScript, Tailwind CSS, Vite |
| Backend        | Node.js, Express.js, PostgreSQL          |
| Cache          | Redis                                    |
| Data Ingestion | Node.js, Cron Jobs                       |
| Logging        | Winston                                  |
| Deployment     | Railway, Vercel, Docker                  |

## 📊 API Endpoints

| Method | Endpoint                          | Purpose          |
| ------ | --------------------------------- | ---------------- |
| GET    | `/api/v1/districts`               | All districts    |
| GET    | `/api/v1/districts/:code/summary` | District metrics |
| GET    | `/api/v1/rankings`                | Top 5 districts  |
| GET    | `/api/v1/districts/:code/trend`   | Monthly trends   |
| GET    | `/api/v1/detect-district`         | Geolocation      |

See [Backend README](./backend/README.md) for full API documentation.
