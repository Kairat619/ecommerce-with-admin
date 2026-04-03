"""Main FastAPI application using SQLite."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import uuid
from datetime import datetime, timezone

from config.settings import settings
from config.database import init_db, SessionLocal, engine
from utils.security import hash_password
from routers import (
    auth_router, categories_router, products_router,
    cart_router, orders_router, admin_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def seed_admin():
    """Seed admin user if not exists, or update password if changed."""
    db = SessionLocal()
    try:
        from models.models import User
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not existing:
            admin = User(
                id=str(uuid.uuid4()),
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                name="Admin",
                picture=None,
                phone=None,
                role="admin",
                is_active=True,
                is_deleted=False,
                auth_provider="local"
            )
            db.add(admin)
            db.commit()
            logger.info(f"Admin user created: {settings.ADMIN_EMAIL}")
        else:
            # Always update password for local auth users on startup
            if existing.auth_provider == "local":
                new_hash = hash_password(settings.ADMIN_PASSWORD)
                if existing.password_hash != new_hash:
                    existing.password_hash = new_hash
                    db.flush()  # Force SQLAlchemy to detect the change
                    db.commit()
                    logger.info(f"Admin password updated: {settings.ADMIN_EMAIL}")
                else:
                    logger.info(f"Admin password unchanged: {settings.ADMIN_EMAIL}")
    finally:
        db.close()


async def seed_sample_data():
    """Seed sample categories and products."""
    db = SessionLocal()
    try:
        from models.models import Category, Product
        
        if db.query(Category).first():
            return  # Data already seeded
        
        categories_data = [
            {"name": "Electronics", "slug": "electronics", "description": "Latest tech gadgets and devices", "image_url": "https://images.unsplash.com/photo-1662348316783-74c476374fcb?w=400", "sort_order": 1},
            {"name": "Fashion", "slug": "fashion", "description": "Trendy clothing and accessories", "image_url": "https://images.unsplash.com/photo-1562046433-dd0db5baddcd?w=400", "sort_order": 2},
            {"name": "Home & Living", "slug": "home-living", "description": "Modern home decor and furniture", "image_url": "https://images.unsplash.com/photo-1756474215958-f0c2a31eddc1?w=400", "sort_order": 3},
        ]
        
        category_ids = {}
        for cat_data in categories_data:
            cat_id = str(uuid.uuid4())
            category = Category(
                id=cat_id,
                name=cat_data["name"],
                slug=cat_data["slug"],
                description=cat_data["description"],
                image_url=cat_data["image_url"],
                sort_order=cat_data["sort_order"],
                is_active=True,
                is_deleted=False
            )
            db.add(category)
            db.flush()
            category_ids[cat_data["slug"]] = cat_id
        
        products_data = [
            {
                "name": "Premium Laptop Pro",
                "slug": "premium-laptop-pro",
                "description": "High-performance laptop with 16GB RAM, 512GB SSD, and stunning 4K display. Perfect for professionals and creatives who demand the best.",
                "short_description": "Powerful laptop for professionals",
                "price": 1299.99,
                "compare_at_price": 1499.99,
                "stock_quantity": 50,
                "images": ["https://images.unsplash.com/photo-1662348316783-74c476374fcb?w=800"],
                "thumbnail": "https://images.unsplash.com/photo-1662348316783-74c476374fcb?w=400",
                "category_id": category_ids["electronics"],
                "is_featured": True,
                "sku": "LAPTOP-001"
            },
            {
                "name": "Wireless Earbuds Ultra",
                "slug": "wireless-earbuds-ultra",
                "description": "Premium wireless earbuds with active noise cancellation and 30-hour battery life. Experience crystal-clear audio with deep bass.",
                "short_description": "Immersive audio experience",
                "price": 199.99,
                "compare_at_price": 249.99,
                "stock_quantity": 100,
                "images": ["https://images.pexels.com/photos/35147149/pexels-photo-35147149.jpeg?w=800"],
                "thumbnail": "https://images.pexels.com/photos/35147149/pexels-photo-35147149.jpeg?w=400",
                "category_id": category_ids["electronics"],
                "is_featured": True,
                "sku": "EARBUDS-001"
            },
            {
                "name": "Smart Watch Series X",
                "slug": "smart-watch-series-x",
                "description": "Advanced smartwatch with comprehensive health monitoring, GPS tracking, and an impressive 5-day battery life. Stay connected in style.",
                "short_description": "Your health companion",
                "price": 349.99,
                "compare_at_price": None,
                "stock_quantity": 75,
                "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
                "thumbnail": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
                "category_id": category_ids["electronics"],
                "is_featured": True,
                "sku": "WATCH-001"
            },
            {
                "name": "Running Shoes Pro",
                "slug": "running-shoes-pro",
                "description": "Lightweight running shoes with advanced cushioning technology. Engineered for comfort and performance on any terrain.",
                "short_description": "Run faster, run further",
                "price": 129.99,
                "compare_at_price": 159.99,
                "stock_quantity": 200,
                "images": ["https://images.unsplash.com/photo-1562046433-dd0db5baddcd?w=800"],
                "thumbnail": "https://images.unsplash.com/photo-1562046433-dd0db5baddcd?w=400",
                "category_id": category_ids["fashion"],
                "is_featured": True,
                "sku": "SHOES-001"
            },
            {
                "name": "Classic Denim Jacket",
                "slug": "classic-denim-jacket",
                "description": "Timeless denim jacket with modern fit and premium quality fabric. A wardrobe essential that never goes out of style.",
                "short_description": "Effortless style",
                "price": 89.99,
                "compare_at_price": None,
                "stock_quantity": 150,
                "images": ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"],
                "thumbnail": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
                "category_id": category_ids["fashion"],
                "is_featured": False,
                "sku": "JACKET-001"
            },
            {
                "name": "Minimalist Desk Lamp",
                "slug": "minimalist-desk-lamp",
                "description": "Modern desk lamp with adjustable brightness and built-in wireless charging base. Illuminate your workspace in style.",
                "short_description": "Illuminate your workspace",
                "price": 79.99,
                "compare_at_price": None,
                "stock_quantity": 80,
                "images": ["https://images.unsplash.com/photo-1756474215958-f0c2a31eddc1?w=800"],
                "thumbnail": "https://images.unsplash.com/photo-1756474215958-f0c2a31eddc1?w=400",
                "category_id": category_ids["home-living"],
                "is_featured": True,
                "sku": "LAMP-001"
            },
            {
                "name": "Modern Nightstand",
                "slug": "modern-nightstand",
                "description": "Sleek nightstand with built-in USB ports and soft-close drawer. The perfect blend of form and function.",
                "short_description": "Functional elegance",
                "price": 199.99,
                "compare_at_price": None,
                "stock_quantity": 40,
                "images": ["https://images.unsplash.com/photo-1762856490803-8e200418973a?w=800"],
                "thumbnail": "https://images.unsplash.com/photo-1762856490803-8e200418973a?w=400",
                "category_id": category_ids["home-living"],
                "is_featured": False,
                "sku": "NIGHTSTAND-001"
            },
            {
                "name": "Portable Bluetooth Speaker",
                "slug": "portable-bluetooth-speaker",
                "description": "Waterproof Bluetooth speaker with 360° sound and 20-hour playtime. Take your music anywhere with premium audio quality.",
                "short_description": "Music anywhere",
                "price": 99.99,
                "compare_at_price": 129.99,
                "stock_quantity": 120,
                "images": ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800"],
                "thumbnail": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
                "category_id": category_ids["electronics"],
                "is_featured": True,
                "sku": "SPEAKER-001"
            },
        ]
        
        for prod_data in products_data:
            product = Product(
                id=str(uuid.uuid4()),
                name=prod_data["name"],
                slug=prod_data["slug"],
                description=prod_data["description"],
                short_description=prod_data["short_description"],
                price=prod_data["price"],
                compare_at_price=prod_data.get("compare_at_price"),
                stock_quantity=prod_data["stock_quantity"],
                images=prod_data["images"],
                thumbnail=prod_data["thumbnail"],
                category_id=prod_data["category_id"],
                is_featured=prod_data["is_featured"],
                sku=prod_data["sku"],
                is_active=True,
                is_deleted=False,
                track_inventory=True,
                allow_backorder=False,
                low_stock_threshold=10
            )
            db.add(product)
        
        db.commit()
        logger.info("Sample data seeded successfully")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("Starting application...")
    init_db()
    await seed_admin()
    await seed_sample_data()
    logger.info("Application started successfully")
    
    yield
    
    logger.info("Shutting down application...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(categories_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


@app.get("/api")
async def root():
    """Root endpoint."""
    return {"message": "E-Commerce API", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Log all unhandled exceptions."""
    import traceback
    logger.error(f"Unhandled exception: {exc}\n{traceback.format_exc()}")
    return {"detail": str(exc) if hasattr(exc, 'detail') else "Internal server error"}
