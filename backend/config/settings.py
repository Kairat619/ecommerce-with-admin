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
    
    # SMTP Email Settings
    SMTP_ENABLED: bool = os.environ.get('SMTP_ENABLED', 'false').lower() == 'true'
    SMTP_HOST: str = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    SMTP_PORT: int = int(os.environ.get('SMTP_PORT', '587'))
    SMTP_USERNAME: str = os.environ.get('SMTP_USERNAME', '')
    SMTP_PASSWORD: str = os.environ.get('SMTP_PASSWORD', '')
    SMTP_FROM_EMAIL: str = os.environ.get('SMTP_FROM_EMAIL', 'noreply@yourdomain.com')
    SMTP_FROM_NAME: str = os.environ.get('SMTP_FROM_NAME', 'E-Commerce')
    
    # Resend Email API (alternative to SMTP)
    RESEND_API_KEY: str = os.environ.get('RESEND_API_KEY', '')
    RESEND_FROM_EMAIL: str = os.environ.get('RESEND_FROM_EMAIL', 'onboarding@resend.dev')
    
    # reCAPTCHA v3 (get keys from https://www.google.com/recaptcha/admin)
    RECAPTCHA_SITE_KEY: str = os.environ.get('RECAPTCHA_SITE_KEY', '')
    RECAPTCHA_SECRET_KEY: str = os.environ.get('RECAPTCHA_SECRET_KEY', '')


settings = Settings()
