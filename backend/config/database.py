"""Database configuration using SQLite with SQLAlchemy."""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

from config.settings import settings

ROOT_DIR = Path(__file__).parent.parent
DATABASE_URL = os.environ.get('DATABASE_URL', f"sqlite:///{ROOT_DIR}/ecommerce.db")

if "postgresql" in DATABASE_URL and "psycopg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
pool_class = StaticPool if "sqlite" in DATABASE_URL else None

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    poolclass=pool_class,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    from models.models import User, Category, Product, CartItem, Order, OrderItem, Address, RefreshToken
    Base.metadata.create_all(bind=engine)
    migrate_schema()


def migrate_schema():
    """Add missing columns to existing tables."""
    import logging
    logger = logging.getLogger(__name__)
    
    if "postgresql" in DATABASE_URL:
        db = SessionLocal()
        try:
            from sqlalchemy import text
            
            tables_to_migrate = {
                'products': [
                    ('images', 'JSON DEFAULT \'[]\''),
                    ('thumbnail', 'VARCHAR(500)'),
                    ('short_description', 'VARCHAR(500)'),
                    ('cost_price', 'FLOAT'),
                    ('barcode', 'VARCHAR(100)'),
                    ('low_stock_threshold', 'INTEGER DEFAULT 10'),
                    ('track_inventory', 'BOOLEAN DEFAULT TRUE'),
                    ('allow_backorder', 'BOOLEAN DEFAULT FALSE'),
                    ('weight', 'FLOAT'),
                    ('dimensions', 'JSON'),
                    ('attributes', 'JSON DEFAULT \'{}\''),
                    ('is_deleted', 'BOOLEAN DEFAULT FALSE'),
                ],
                'users': [
                    ('auth_provider', 'VARCHAR(50) DEFAULT \'local\''),
                    ('is_deleted', 'BOOLEAN DEFAULT FALSE'),
                ],
                'orders': [
                    ('is_deleted', 'BOOLEAN DEFAULT FALSE'),
                ],
                'categories': [
                    ('is_deleted', 'BOOLEAN DEFAULT FALSE'),
                ],
            }
            
            for table_name, columns in tables_to_migrate.items():
                try:
                    result = db.execute(text(f"""
                        SELECT column_name FROM information_schema.columns 
                        WHERE table_name = '{table_name}'
                    """))
                    existing_cols = {row[0] for row in result.fetchall()}
                    
                    for col_name, col_def in columns:
                        if col_name not in existing_cols:
                            db.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_def}"))
                            logger.info(f"Added column {col_name} to {table_name}")
                except Exception as e:
                    logger.warning(f"Could not migrate table {table_name}: {e}")
            
            db.commit()
        except Exception as e:
            logger.error(f"Migration error: {e}")
            db.rollback()
        finally:
            db.close()
