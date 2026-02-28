# 🛒 E-Commerce Store with Admin Panel

A full-stack ecommerce application with a customer-facing storefront and an admin dashboard, built with **FastAPI** (Python) + **React** + **SQLite**.

---

## 📋 Prerequisites

Before running this project, make sure you have these installed:

| Requirement | Version | Check Command |
|------------|---------|---------------|
| **Python** | 3.10+ | `python --version` |
| **Node.js** | 18+ | `node --version` |
| **Yarn** | 1.22+ | `yarn --version` |

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server (port 8001)
python -m uvicorn server:app --host 0.0.0.0 --port 8001
```

### 2. Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
yarn install

# Start the development server (port 3000)
yarn start
```

### 3. Open the App

| URL | Purpose |
|-----|---------|
| **http://localhost:3000** | Customer storefront |
| **http://localhost:3000/admin** | Admin dashboard |
| **http://localhost:8001/api** | Backend API root |
| **http://localhost:8001/docs** | Swagger API docs |

---

## 🔑 Default Admin Login

| Field | Value |
|-------|-------|
| Email | `admin@google.com` |
| Password | `admin` |

> The admin account is automatically created on first startup. You can change these credentials in `backend/.env`.

---

## ⚙️ Configuration

### Backend (`backend/.env`)

```env
# SQLite Database (local file - no setup required!)
DATABASE_URL=sqlite:///path/to/ecommerce.db

# JWT Security (change this to a random string in real production!)
SECRET_KEY=your-secret-key-here

# CORS Settings (frontend URL)
CORS_ORIGINS=http://localhost:3000

# Admin Seed Account
ADMIN_EMAIL=admin@shop.com
ADMIN_PASSWORD=admin123

# Debug Mode
DEBUG=true
```

### Frontend (`frontend/.env`)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🏗️ Project Structure

```
├── backend/
│   ├── config/          # Settings & database configuration (SQLite)
│   ├── models/          # SQLAlchemy data models
│   ├── routers/         # API route handlers
│   │   ├── auth.py      # Authentication (login, register, JWT)
│   │   ├── admin.py     # Admin CRUD operations
│   │   ├── products.py  # Product listing & search
│   │   ├── categories.py# Category management
│   │   ├── cart.py      # Shopping cart
│   │   └── orders.py    # Order management
│   ├── schemas/         # Pydantic validation schemas
│   ├── utils/           # Security & helper utilities
│   ├── server.py        # FastAPI app entry point
│   └── requirements.txt # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components (Radix UI)
│   │   ├── context/     # React contexts (Auth, Cart)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── i18n/       # Internationalization (EN, KK, RU)
│   │   ├── layouts/    # Store & Admin layouts
│   │   ├── lib/        # API client & utilities
│   │   └── pages/      # Page components
│   ├── package.json
│   └── craco.config.js  # Webpack configuration
│
└── README.md
```

---

## ✨ Features

### Storefront
- 🏠 Homepage with hero, featured products, categories
- 🔍 Product search & filtering
- 🛒 Shopping cart (works for guests & logged-in users)
- 📦 Checkout with order tracking
- 👤 User registration & login
- 🌍 Multi-language support (English, Kazakh, Russian)

### Admin Panel
- 📊 Dashboard with sales statistics
- 📦 Product management (CRUD)
- 🏷️ Category management
- 📋 Order management & status updates
- 👥 User management & role control

---

## 📝 Notes

- **Database**: This project uses SQLite for local development (no external database required). The database file is created automatically at `backend/ecommerce.db`.
- **Sample Data**: The app automatically seeds sample categories and products on first run.
- **OAuth**: Google OAuth integration requires the Emergent Auth service. For local development, use email/password login instead.
- **Cookies**: In `DEBUG=true` mode, cookies use `secure=false` and `samesite=lax` for HTTP localhost compatibility.
