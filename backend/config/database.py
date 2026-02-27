"""Database configuration using SQLite with SQLAlchemy."""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

from config.settings import settings

ROOT_DIR = Path(__file__).parent.parent
DATABASE_URL = os.environ.get('DATABASE_URL', f"sqlite:///{ROOT_DIR}/ecommerce.db")

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    poolclass=StaticPool if "sqlite" in DATABASE_URL else None,
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
