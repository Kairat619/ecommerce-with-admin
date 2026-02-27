"""Products router using SQLite."""
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from config.database import get_db
from schemas.schemas import (
    ProductResponse, ProductListResponse, ProductWithCategory,
    PaginatedResponse, CategoryResponse
)
from models.models import Product, Category

router = APIRouter(prefix="/products", tags=["Products"])


def product_to_dict(product: Product, include_category: bool = False):
    """Convert product model to dictionary."""
    data = {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "short_description": product.short_description,
        "price": product.price,
        "compare_at_price": product.compare_at_price,
        "cost_price": product.cost_price,
        "sku": product.sku,
        "barcode": product.barcode,
        "stock_quantity": product.stock_quantity,
        "low_stock_threshold": product.low_stock_threshold,
        "track_inventory": product.track_inventory,
        "allow_backorder": product.allow_backorder,
        "images": product.images or [],
        "thumbnail": product.thumbnail,
        "meta_title": product.meta_title,
        "meta_description": product.meta_description,
        "is_active": product.is_active,
        "is_featured": product.is_featured,
        "is_deleted": product.is_deleted,
        "weight": product.weight,
        "dimensions": product.dimensions,
        "attributes": product.attributes or {},
        "category_id": product.category_id,
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "updated_at": product.updated_at.isoformat() if product.updated_at else None
    }
    if include_category and product.category:
        data["category"] = {
            "id": product.category.id,
            "name": product.category.name,
            "slug": product.category.slug,
            "description": product.category.description,
            "image_url": product.category.image_url,
            "sort_order": product.category.sort_order,
            "is_active": product.category.is_active,
            "created_at": product.category.created_at.isoformat() if product.category.created_at else None,
            "updated_at": product.category.updated_at.isoformat() if product.category.updated_at else None
        }
    return data


@router.get("", response_model=PaginatedResponse)
async def list_products(
    q: Optional[str] = Query(None, description="Search query"),
    category_id: Optional[str] = Query(None),
    category_slug: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    in_stock: Optional[bool] = Query(None),
    is_featured: Optional[bool] = Query(None),
    sort_by: str = Query("created_at", enum=["created_at", "price", "name"]),
    sort_order: str = Query("desc", enum=["asc", "desc"]),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List products with filtering, sorting, and pagination."""
    query = db.query(Product).filter(Product.is_active == True, Product.is_deleted == False)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    elif category_slug:
        category = db.query(Category).filter(Category.slug == category_slug).first()
        if category:
            query = query.filter(Product.category_id == category.id)
    
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Product.sku.ilike(search_term)
            )
        )
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    if in_stock is not None:
        if in_stock:
            query = query.filter(Product.stock_quantity > 0)
        else:
            query = query.filter(Product.stock_quantity == 0)
    
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    
    total = query.count()
    
    sort_column = getattr(Product, sort_by, Product.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    skip = (page - 1) * page_size
    products = query.offset(skip).limit(page_size).all()
    
    return PaginatedResponse(
        items=[product_to_dict(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size if total > 0 else 1
    )


@router.get("/featured", response_model=List[ProductListResponse])
async def get_featured_products(
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get featured products."""
    products = db.query(Product).filter(
        Product.is_active == True,
        Product.is_deleted == False,
        Product.is_featured == True
    ).order_by(Product.created_at.desc()).limit(limit).all()
    
    return [product_to_dict(p) for p in products]


@router.get("/new-arrivals", response_model=List[ProductListResponse])
async def get_new_arrivals(
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get newest products."""
    products = db.query(Product).filter(
        Product.is_active == True,
        Product.is_deleted == False
    ).order_by(Product.created_at.desc()).limit(limit).all()
    
    return [product_to_dict(p) for p in products]


@router.get("/{product_id}", response_model=ProductWithCategory)
async def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get product by ID."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_deleted == False
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product_to_dict(product, include_category=True)


@router.get("/slug/{slug}", response_model=ProductWithCategory)
async def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get product by slug."""
    product = db.query(Product).filter(
        Product.slug == slug,
        Product.is_deleted == False
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product_to_dict(product, include_category=True)
