# AGENTS.md - E-Commerce with Admin

## Project Overview

Full-stack ecommerce app: **FastAPI (Python 3.12)** backend + **React 19 (JSX)** frontend.
- **Backend**: `backend/` - FastAPI, SQLAlchemy 2.0, Pydantic 2, SQLite/PostgreSQL, JWT auth
- **Frontend**: `frontend/` - React 19, Vite 6, shadcn/ui, Tailwind CSS 3, i18next (EN/KK/RU)

## Commands

### Frontend (run from `frontend/`)
```bash
yarn install          # Install dependencies
yarn dev              # Dev server on port 3000
yarn build            # Production build to dist/
yarn preview          # Preview production build
```

### Backend (run from `backend/`)
```bash
python -m venv venv   # Create virtual env (first time only)
venv\Scripts\activate  # Windows activate
source venv/bin/activate  # Linux/Mac activate
pip install -r requirements.txt  # Install deps
python -m uvicorn server:app --host 0.0.0.0 --port 8001  # Dev server
```

### Testing
No test framework is configured. Create tests with `pytest` (backend) or `vitest` (frontend) when adding new features. Place backend tests in `backend/tests/` and frontend tests alongside source as `*.test.jsx`.

## Frontend Code Style

### File & Naming Conventions
- **Components**: PascalCase filenames and exports, e.g., `ProductCard.jsx`
- **Named exports** preferred over default: `export const ProductCard = ...`
- **Pages**: Named `XxxPage.jsx` (store) or placed in `pages/admin/` as `Xxx.jsx`
- **Hooks**: `useXxx.jsx` in `src/hooks/`
- **Contexts**: `XxxContext.jsx` in `src/context/`
- **Utils**: camelCase, e.g., `api.jsx`, `utils.jsx`

### Imports
- Use `@/` path aliases from `jsconfig.json`: `import { cn } from '@/lib/utils'`
- Relative imports use `../` style (project mostly uses relative, not alias)
- Import order: React -> third-party -> internal components -> contexts/hooks -> lib
- Group imports by type with blank line separators

### Component Patterns
```jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

export const MyComponent = ({ propA, propB = 'default' }) => {
  const { t } = useTranslation();
  const [state, setState] = useState(null);

  useEffect(() => {
    // fetch data
  }, []);

  return <div>{t('key')}</div>;
};
```

### Styling
- **Tailwind CSS** exclusively - no CSS modules or styled-components
- Use `cn()` from `@/lib/utils` for conditional class merging
- Custom design tokens defined in `tailwind.config.cjs` (primary, secondary, surface, etc.)
- Custom font utilities: `font-serif`, `font-body-md`, `font-label-lg`
- UI components from `src/components/ui/` (shadcn/ui, 46 components available)
- Icons from `lucide-react`

### State & Data
- **React Context** for global state: Auth, Cart, Wishlist, ProductUpdate
- **Axios** for HTTP via centralized `src/lib/api.jsx` - use the exported API objects (`authAPI`, `productsAPI`, `adminAPI`, etc.)
- API base URL from `import.meta.env.VITE_BACKEND_URL`
- JWT stored in `localStorage` as `access_token` / `refresh_token`

### i18n
- All user-facing strings use `useTranslation()`: `const { t } = useTranslation()`
- Keys follow pattern `section.key`, e.g., `admin.dashboard`, `home.viewAll`
- Translation files in `src/i18n/` (locales: en, kk, ru)

## Backend Code Style

### File & Naming Conventions
- **snake_case** for all Python files, functions, variables
- **Routers**: `routers/xxx.py` with `router = APIRouter(prefix="/xxx", tags=["Xxx"])`
- **Models**: SQLAlchemy models in `models/models.py`
- **Schemas**: Pydantic schemas in `schemas/schemas.py`, use `Base/Create/Update/Response` suffix pattern
- All routers exported from `routers/__init__.py`

### API Patterns
```python
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=PaginatedResponse)
async def list_products(
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db)
):
    """Docstring describing the endpoint."""
    query = db.query(Product).filter(Product.is_active == True)
    # ... filtering, pagination
    return PaginatedResponse(items=[...], total=total, page=page, page_size=page_size, total_pages=...)
```

### Schemas
- Use Pydantic v2: `model_config = ConfigDict(from_attributes=True)`
- Field validation with `Field(min_length=, max_length=, gt=, ge=)`
- Inheritance pattern: `Base` -> `Create`/`Update` -> `Response`
- Enums for fixed values: `class OrderStatus(str, Enum)`

### Database
- SQLAlchemy 2.0 with `SessionLocal()` context pattern
- Use `Depends(get_db)` for router endpoints
- Soft deletes with `is_deleted = False` filter pattern
- UUIDs as string IDs

### Error Handling
- Raise `HTTPException(status_code=404, detail="Not found")` for client errors
- Global exception handler in `server.py` logs unhandled exceptions
- Use `try/finally` for database session cleanup

## Architecture

### Frontend Structure
```
frontend/src/
  components/     # Reusable UI (ProductCard, LanguageSwitcher)
    ui/           # shadcn/ui primitives (46 components)
    seo/          # SEO components
  context/        # React Context providers
  hooks/          # Custom hooks
  i18n/           # i18next config & locales
  layouts/        # StoreLayout, AdminLayout
  lib/            # api.jsx, utils.jsx, sitemap.js
  pages/          # Page components
    admin/        # Admin dashboard pages
```

### Backend Structure
```
backend/
  config/         # settings.py, database.py
  models/         # SQLAlchemy ORM models
  routers/        # FastAPI route handlers
  schemas/        # Pydantic validation schemas
  utils/          # Security helpers, rate limiter
  server.py       # FastAPI entry point
```

## Key Conventions
- **No TypeScript** - frontend is plain JavaScript (.jsx)
- **No linter/formatter** configured - follow existing code style
- **Soft deletes** everywhere - use `is_deleted` flag, never hard delete
- **JWT auth** via `Authorization: Bearer <token>` header (auto-handled by api.jsx interceptors)
- **Protected routes** via `<ProtectedRoute>` component (adminOnly prop for admin pages)
- **Environment**: backend port 8001, frontend port 3000, CORS configured in `backend/.env`
