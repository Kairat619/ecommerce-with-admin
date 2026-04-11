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
    CORS_ORIGINS: list = (
        os.environ.get('CORS_ORIGINS', '*').split(',') 
        if os.environ.get('CORS_ORIGINS') 
        else [
            "http://localhost:5173", 
            "https://builda-ecommerce1.netlify.app",
            "https://*.netlify.app",
        ]
    )
    
    # Admin seed
    ADMIN_EMAIL: str = os.environ.get('ADMIN_EMAIL', 'admin@shop.com')
    ADMIN_PASSWORD: str = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.environ.get('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET: str = os.environ.get('GOOGLE_CLIENT_SECRET', '')
    GOOGLE_REDIRECT_URI: str = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:5173/auth/callback')
    
    # App settings
    APP_NAME: str = "E-Commerce API"
    DEBUG: bool = os.environ.get('DEBUG', 'false').lower() == 'true'
    
    # Frontend URL for sitemap
    FRONTEND_URL: str = os.environ.get('FRONTEND_URL', 'https://yourdomain.com')


settings = Settings()
