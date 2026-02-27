"""Application settings and configuration."""
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')


class Settings:
    # Database
    DATABASE_URL: str = os.environ.get('DATABASE_URL', f'sqlite:///{ROOT_DIR}/ecommerce.db')
    
    # JWT Settings
    SECRET_KEY: str = os.environ.get('SECRET_KEY', 'your-super-secret-key-change-in-production')
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: list = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    # Admin seed
    ADMIN_EMAIL: str = os.environ.get('ADMIN_EMAIL', 'admin@shop.com')
    ADMIN_PASSWORD: str = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    # App settings
    APP_NAME: str = "E-Commerce API"
    DEBUG: bool = os.environ.get('DEBUG', 'false').lower() == 'true'


settings = Settings()
