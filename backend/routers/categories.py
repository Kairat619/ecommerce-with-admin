"""Categories router using SQLite."""
from typing import List
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.schemas import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryWithProducts
from models.models import Category, Product

router = APIRouter(prefix="/categories", tags=["Categories"])


def category_to_dict(category: Category, include_count: bool = False):
    """Convert category model to dictionary."""
    data = {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "image_url": category.image_url,
        "parent_id": category.parent_id,
        "is_active": category.is_active,
        "is_deleted": category.is_deleted,
        "sort_order": category.sort_order,
        "created_at": category.created_at.isoformat() if category.created_at else None,
        "updated_at": category.updated_at.isoformat() if category.updated_at else None
    }
    if include_count:
        count = Product.query.filter(
            Product.category_id == category.id,
            Product.is_active == True,
            Product.is_deleted == False
        ).count() if hasattr(Product, 'query') else db.query(Product).filter(
            Product.category_id == category.id,
            Product.is_active == True,
            Product.is_deleted == False
        ).count()
        data["products_count"] = count
    return data


@router.get("", response_model=List[CategoryResponse])
async def list_categories(
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """List all categories."""
    query = db.query(Category).filter(Category.is_deleted == False)
    if active_only:
        query = query.filter(Category.is_active == True)
    
    categories = query.order_by(Category.sort_order, Category.name).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "image_url": c.image_url,
            "parent_id": c.parent_id,
            "is_active": c.is_active,
            "is_deleted": c.is_deleted,
            "sort_order": c.sort_order,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None
        }
        for c in categories
    ]


@router.get("/with-counts", response_model=List[CategoryWithProducts])
async def list_categories_with_counts(
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """List categories with product counts."""
    query = db.query(Category).filter(Category.is_deleted == False)
    if active_only:
        query = query.filter(Category.is_active == True)
    
    categories = query.order_by(Category.sort_order, Category.name).all()
    
    result = []
    for cat in categories:
        count = db.query(Product).filter(
            Product.category_id == cat.id,
            Product.is_active == True,
            Product.is_deleted == False
        ).count()
        
        result.append({
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "image_url": cat.image_url,
            "parent_id": cat.parent_id,
            "is_active": cat.is_active,
            "is_deleted": cat.is_deleted,
            "sort_order": cat.sort_order,
            "created_at": cat.created_at.isoformat() if cat.created_at else None,
            "updated_at": cat.updated_at.isoformat() if cat.updated_at else None,
            "products_count": count
        })
    
    return result


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str, db: Session = Depends(get_db)):
    """Get category by ID."""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.is_deleted == False
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "image_url": category.image_url,
        "parent_id": category.parent_id,
        "is_active": category.is_active,
        "is_deleted": category.is_deleted,
        "sort_order": category.sort_order,
        "created_at": category.created_at.isoformat() if category.created_at else None,
        "updated_at": category.updated_at.isoformat() if category.updated_at else None
    }


@router.get("/slug/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get category by slug."""
    category = db.query(Category).filter(
        Category.slug == slug,
        Category.is_deleted == False
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "description": category.description,
        "image_url": category.image_url,
        "parent_id": category.parent_id,
        "is_active": category.is_active,
        "is_deleted": category.is_deleted,
        "sort_order": category.sort_order,
        "created_at": category.created_at.isoformat() if category.created_at else None,
        "updated_at": category.updated_at.isoformat() if category.updated_at else None
    }
