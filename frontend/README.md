# MGNREGA Haryana Frontend

> Beautiful, responsive React frontend for monitoring MGNREGA performance across Haryana districts. Built with React, TypeScript, Tailwind CSS, and Vite.

![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Vite](https://img.shields.io/badge/Vite-4.0+-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-38B2AC)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

## 📋 Table of Contents

- [About](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)

## 🎯 About The Project

**MGNREGA Haryana Frontend** is a modern, mobile-responsive web application that visualizes MGNREGA performance data for all Haryana districts with interactive charts, real-time metrics, district rankings, and bilingual support.

## ✨ Features

- ✅ Home Page Dashboard - KPIs, rankings, insights
- ✅ District Details Page - Comprehensive metrics
- ✅ Geolocation Detection - Auto-detect user's district
- ✅ Interactive Charts - Recharts for visualization
- ✅ Bilingual UI - English & Hindi support
- ✅ Real-time Data - Live API integration
- ✅ Responsive Design - Works on all devices
- ✅ Performance Optimized - Fast load times
- ✅ Dark Mode Ready - Tailwind support
- ✅ Error Handling - User-friendly messages

## 🛠️ Tech Stack

| Layer      | Technology   | Version |
| ---------- | ------------ | ------- |
| Build Tool | Vite         | 4.0+    |
| Framework  | React        | 18+     |
| Language   | TypeScript   | 5.0+    |
| Styling    | Tailwind CSS | 3.0+    |
| Charts     | Recharts     | 2.0+    |

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js v16 or higher
- npm v7+ or yarn v1.22+
- Git
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Optional:**

- VSCode with ES7+ extensions
- Tailwind CSS IntelliSense extension
- Postman or Thunder Client

**Verify installations:**

```
node --version # v16+
npm --version # v7+
git --version
```

## 🚀 Installation

### Step 1: Clone Repository

```
git clone https://github.com/mandyyy26/mgnrega-haryana.git
cd mgnrega-haryana/frontend
```

### Step 2: Install Dependencies

```
npm install
```

### Step 3: Environment Setup

Create `.env.local` file:

```
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=10000
VITE_APP_NAME=MGNREGA Haryana
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_GEOLOCATION=true
VITE_LOG_LEVEL=info
```

### Step 4: Start Development Server

```
npm run dev
```

Visit `http://localhost:3000` in your browser.
