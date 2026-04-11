"""Sitemap router for SEO."""
from fastapi import APIRouter, Response, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from config.database import SessionLocal
from config.settings import settings

router = APIRouter(tags=["SEO"])

FRONTEND_URL = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') and settings.FRONTEND_URL else "https://yourdomain.com"


def get_db():
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def format_date(dt):
    """Format datetime for sitemap."""
    if dt is None:
        return datetime.now().strftime("%Y-%m-%d")
    if isinstance(dt, str):
        return dt[:10] if len(dt) >= 10 else datetime.now().strftime("%Y-%m-%d")
    return dt.strftime("%Y-%m-%d")


@router.get("/sitemap.xml")
async def get_sitemap(db: Session = Depends(get_db)):
    """Generate XML sitemap for search engines."""
    
    from models.models import Product, Category
    
    urls = []
    today = datetime.now().strftime("%Y-%m-%d")
    
    urls.append(f"""  <url>
    <loc>{FRONTEND_URL}/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>""")
    
    urls.append(f"""  <url>
    <loc>{FRONTEND_URL}/products</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>""")
    
    categories = db.query(Category).filter(
        Category.is_active == True,
        Category.is_deleted == False
    ).all()
    
    for category in categories:
        urls.append(f"""  <url>
    <loc>{FRONTEND_URL}/products?category={category.slug}</loc>
    <lastmod>{format_date(category.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>""")
    
    products = db.query(Product).filter(
        Product.is_active == True,
        Product.is_deleted == False
    ).all()
    
    for product in products:
        urls.append(f"""  <url>
    <loc>{FRONTEND_URL}/products/{product.slug}</loc>
    <lastmod>{format_date(product.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")
    
    sitemap_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""
    
    return Response(
        content=sitemap_xml,
        media_type="application/xml"
    )


@router.get("/robots.txt")
async def get_robots():
    """Get robots.txt content."""
    robots_txt = f"""User-agent: *
Allow: /
Disallow: /admin/
Disallow: /checkout
Disallow: /orders
Disallow: /wishlist
Disallow: /cart
Disallow: /api/admin/
Disallow: /api/cart/

User-agent: Googlebot
Allow: /

Sitemap: {FRONTEND_URL}/api/sitemap.xml
"""
    return Response(
        content=robots_txt,
        media_type="text/plain"
    )
