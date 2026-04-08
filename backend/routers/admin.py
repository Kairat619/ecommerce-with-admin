"""Admin router for CMS operations using SQLite."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Request, Depends
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from config.database import get_db
from schemas.schemas import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
    OrderResponse, OrderStatusUpdate,
    AdminUserUpdate, UserResponse, DashboardStats, PaginatedResponse,
    UserRole, OrderStatus, SiteSettingsUpdate, SiteSettingsResponse
)
from models.models import Category, Product, Order, OrderItem, User, CartItem, SiteSettings, ProductReview
from routers.auth import get_current_user_from_request

router = APIRouter(prefix="/admin", tags=["Admin"])


async def require_admin(db: Session, request: Request):
    """Require admin role."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(request: Request, db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    await require_admin(db, request)
    
    total_orders = db.query(Order).count()
    
    total_revenue = db.query(func.sum(Order.total)).filter(
        Order.status.in_(["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"])
    ).scalar() or 0
    
    total_customers = db.query(User).filter(User.role == "CUSTOMER", User.is_deleted == False).count()
    
    total_products = db.query(Product).filter(Product.is_deleted == False).count()
    
    pending_orders = db.query(Order).filter(Order.status == "PENDING").count()
    
    low_stock_products = db.query(Product).filter(
        Product.is_deleted == False,
        Product.track_inventory == True,
        Product.stock_quantity <= Product.low_stock_threshold
    ).count()
    
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    
    recent_orders_data = []
    for order in recent_orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        recent_orders_data.append({
            "id": order.id,
            "order_number": order.order_number,
            "user_id": order.user_id,
            "status": order.status.value if hasattr(order.status, 'value') else order.status,
            "subtotal": order.subtotal,
            "tax_amount": order.tax_amount,
            "shipping_amount": order.shipping_amount,
            "discount_amount": order.discount_amount,
            "total": order.total,
            "shipping_address": order.shipping_address,
            "billing_address": order.billing_address,
            "customer_email": order.customer_email,
            "customer_phone": order.customer_phone,
            "customer_name": order.customer_name,
            "notes": order.notes,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "updated_at": order.updated_at.isoformat() if order.updated_at else None,
            "items": [
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "product_sku": item.product_sku,
                    "product_image": item.product_image,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "total_price": item.total_price,
                    "created_at": item.created_at.isoformat() if item.created_at else None
                }
                for item in items
            ]
        })
    
    return DashboardStats(
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        total_customers=total_customers,
        total_products=total_products,
        pending_orders=pending_orders,
        low_stock_products=low_stock_products,
        recent_orders=recent_orders_data
    )


@router.get("/categories", response_model=list)
async def list_admin_categories(request: Request, db: Session = Depends(get_db)):
    """List all categories for admin."""
    await require_admin(db, request)
    categories = db.query(Category).filter(Category.is_deleted == False).order_by(Category.sort_order, Category.name).all()
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


@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    data: CategoryCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new category."""
    await require_admin(db, request)
    
    base_slug = data.name.lower().replace(" ", "-")
    slug = base_slug
    counter = 1
    
    while db.query(Category).filter(Category.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    category = Category(
        id=str(uuid.uuid4()),
        name=data.name,
        slug=slug,
        description=data.description,
        image_url=data.image_url,
        parent_id=data.parent_id,
        sort_order=data.sort_order or 0,
        is_active=True,
        is_deleted=False
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    
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


@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    data: CategoryUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update a category."""
    await require_admin(db, request)
    
    category = db.query(Category).filter(Category.id == category_id, Category.is_deleted == False).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if data.name is not None:
        category.name = data.name
        base_slug = data.name.lower().replace(" ", "-")
        slug = base_slug
        counter = 1
        while True:
            existing = db.query(Category).filter(Category.slug == slug, Category.id != category_id).first()
            if not existing:
                break
            slug = f"{base_slug}-{counter}"
            counter += 1
        category.slug = slug
    
    if data.description is not None:
        category.description = data.description
    if data.image_url is not None:
        category.image_url = data.image_url
    if data.parent_id is not None:
        category.parent_id = data.parent_id
    if data.is_active is not None:
        category.is_active = data.is_active
    if data.sort_order is not None:
        category.sort_order = data.sort_order
    
    db.commit()
    db.refresh(category)
    
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


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Soft delete a category."""
    await require_admin(db, request)
    
    category = db.query(Category).filter(Category.id == category_id, Category.is_deleted == False).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category.is_deleted = True
    db.commit()
    
    return {"message": "Category deleted"}


@router.get("/products", response_model=PaginatedResponse)
async def list_all_products(
    q: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    low_stock: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """List all products for admin."""
    await require_admin(db, request)
    
    query = db.query(Product).filter(Product.is_deleted == False)
    
    if q:
        search = f"%{q}%"
        query = query.filter(or_(Product.name.ilike(search), Product.sku.ilike(search)))
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    
    if low_stock:
        query = query.filter(
            Product.track_inventory == True,
            Product.stock_quantity <= Product.low_stock_threshold
        )
    
    total = query.count()
    
    products = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return PaginatedResponse(
        items=[
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "description": p.description,
                "short_description": p.short_description,
                "price": p.price,
                "compare_at_price": p.compare_at_price,
                "cost_price": p.cost_price,
                "sku": p.sku,
                "barcode": p.barcode,
                "stock_quantity": p.stock_quantity,
                "low_stock_threshold": p.low_stock_threshold,
                "track_inventory": p.track_inventory,
                "allow_backorder": p.allow_backorder,
                "images": p.images or [],
                "thumbnail": p.thumbnail,
                "meta_title": p.meta_title,
                "meta_description": p.meta_description,
                "is_active": p.is_active,
                "is_featured": p.is_featured,
                "is_deleted": p.is_deleted,
                "weight": p.weight,
                "dimensions": p.dimensions,
                "attributes": p.attributes or {},
                "category_id": p.category_id,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "updated_at": p.updated_at.isoformat() if p.updated_at else None
            }
            for p in products
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size if total > 0 else 1
    )


@router.post("/products", response_model=ProductResponse)
async def create_product(
    data: ProductCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new product."""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        user = await require_admin(db, request)
        logger.info(f"Admin {user.email} creating product: {data.name}")
        
        base_slug = data.name.lower().replace(" ", "-")
        slug = base_slug
        counter = 1
        
        while db.query(Product).filter(Product.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        if data.sku:
            existing_sku = db.query(Product).filter(Product.sku == data.sku).first()
            if existing_sku:
                sku = f"{data.sku}-{uuid.uuid4().hex[:4].upper()}"
            else:
                sku = data.sku
        else:
            sku = f"SKU-{uuid.uuid4().hex[:8].upper()}"
        
        product = Product(
            id=str(uuid.uuid4()),
            name=data.name,
            slug=slug,
            description=data.description,
            short_description=data.short_description,
            price=data.price,
            compare_at_price=data.compare_at_price,
            cost_price=data.cost_price,
            sku=sku,
            barcode=data.barcode,
            stock_quantity=data.stock_quantity,
            low_stock_threshold=data.low_stock_threshold,
            track_inventory=data.track_inventory,
            allow_backorder=data.allow_backorder,
            images=data.images or [],
            thumbnail=data.thumbnail or (data.images[0] if data.images else None),
            meta_title=data.meta_title,
            meta_description=data.meta_description,
            is_active=True,
            is_featured=data.is_featured,
            is_deleted=False,
            weight=data.weight,
            dimensions=data.dimensions,
            attributes=data.attributes or {},
            category_id=data.category_id
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        logger.info(f"Product created successfully: {product.id}")
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise
    
    return {
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


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product_admin(
    product_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get product details for admin."""
    await require_admin(db, request)
    
    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
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


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    data: ProductUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update a product."""
    await require_admin(db, request)
    
    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = data.model_dump(exclude_unset=True)
    
    if "name" in update_data:
        product.name = update_data["name"]
        base_slug = update_data["name"].lower().replace(" ", "-")
        slug = base_slug
        counter = 1
        while True:
            existing = db.query(Product).filter(Product.slug == slug, Product.id != product_id).first()
            if not existing:
                break
            slug = f"{base_slug}-{counter}"
            counter += 1
        product.slug = slug
    
    for key, value in update_data.items():
        if key != "name":
            setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    
    return {
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


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Soft delete a product."""
    await require_admin(db, request)
    
    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.is_deleted = True
    db.commit()
    
    return {"message": "Product deleted"}


@router.get("/orders", response_model=PaginatedResponse)
async def list_all_orders(
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """List all orders for admin."""
    await require_admin(db, request)
    
    query = db.query(Order)
    
    if status:
        query = query.filter(Order.status == status)
    
    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Order.order_number.ilike(search),
                Order.customer_email.ilike(search),
                Order.customer_name.ilike(search)
            )
        )
    
    total = query.count()
    
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    result = []
    for order in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        result.append({
            "id": order.id,
            "order_number": order.order_number,
            "user_id": order.user_id,
            "status": order.status.value if hasattr(order.status, 'value') else order.status,
            "subtotal": order.subtotal,
            "tax_amount": order.tax_amount,
            "shipping_amount": order.shipping_amount,
            "discount_amount": order.discount_amount,
            "total": order.total,
            "shipping_address": order.shipping_address,
            "billing_address": order.billing_address,
            "customer_email": order.customer_email,
            "customer_phone": order.customer_phone,
            "customer_name": order.customer_name,
            "notes": order.notes,
            "admin_notes": order.admin_notes,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "payment_id": order.payment_id,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "updated_at": order.updated_at.isoformat() if order.updated_at else None,
            "items": [
                {
                    "id": item.id,
                    "order_id": item.order_id,
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "product_sku": item.product_sku,
                    "product_image": item.product_image,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "total_price": item.total_price,
                    "created_at": item.created_at.isoformat() if item.created_at else None
                }
                for item in items
            ]
        })
    
    return PaginatedResponse(
        items=result,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size if total > 0 else 1
    )


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order_admin(
    order_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get order details for admin."""
    await require_admin(db, request)
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    return {
        "id": order.id,
        "order_number": order.order_number,
        "user_id": order.user_id,
        "status": order.status.value if hasattr(order.status, 'value') else order.status,
        "subtotal": order.subtotal,
        "tax_amount": order.tax_amount,
        "shipping_amount": order.shipping_amount,
        "discount_amount": order.discount_amount,
        "total": order.total,
        "shipping_address": order.shipping_address,
        "billing_address": order.billing_address,
        "customer_email": order.customer_email,
        "customer_phone": order.customer_phone,
        "customer_name": order.customer_name,
        "notes": order.notes,
        "admin_notes": order.admin_notes,
        "payment_status": order.payment_status,
        "payment_method": order.payment_method,
        "payment_id": order.payment_id,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
        "items": [
            {
                "id": item.id,
                "order_id": item.order_id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "product_sku": item.product_sku,
                "product_image": item.product_image,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item.total_price,
                "created_at": item.created_at.isoformat() if item.created_at else None
            }
            for item in items
        ]
    }


@router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update order status."""
    await require_admin(db, request)
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = data.status.value
    if data.admin_notes:
        order.admin_notes = data.admin_notes
    
    db.commit()
    db.refresh(order)
    
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    return {
        "id": order.id,
        "order_number": order.order_number,
        "user_id": order.user_id,
        "status": order.status.value if hasattr(order.status, 'value') else order.status,
        "subtotal": order.subtotal,
        "tax_amount": order.tax_amount,
        "shipping_amount": order.shipping_amount,
        "discount_amount": order.discount_amount,
        "total": order.total,
        "shipping_address": order.shipping_address,
        "billing_address": order.billing_address,
        "customer_email": order.customer_email,
        "customer_phone": order.customer_phone,
        "customer_name": order.customer_name,
        "notes": order.notes,
        "admin_notes": order.admin_notes,
        "payment_status": order.payment_status,
        "payment_method": order.payment_method,
        "payment_id": order.payment_id,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
        "items": [
            {
                "id": item.id,
                "order_id": item.order_id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "product_sku": item.product_sku,
                "product_image": item.product_image,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item.total_price,
                "created_at": item.created_at.isoformat() if item.created_at else None
            }
            for item in items
        ]
    }


@router.get("/users", response_model=PaginatedResponse)
async def list_users(
    role: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """List all users for admin."""
    await require_admin(db, request)
    
    query = db.query(User).filter(User.is_deleted == False)
    
    if role:
        query = query.filter(User.role == role)
    
    if q:
        search = f"%{q}%"
        query = query.filter(or_(User.email.ilike(search), User.name.ilike(search)))
    
    total = query.count()
    
    users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return PaginatedResponse(
        items=[
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "picture": u.picture,
                "phone": u.phone,
                "role": u.role.value if hasattr(u.role, 'value') else u.role,
                "is_active": u.is_active,
                "is_deleted": u.is_deleted,
                "auth_provider": u.auth_provider,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "updated_at": u.updated_at.isoformat() if u.updated_at else None
            }
            for u in users
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size if total > 0 else 1
    )


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: str,
    data: AdminUserUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update user as admin."""
    await require_admin(db, request)
    
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.name is not None:
        user.name = data.name
    if data.role is not None:
        user.role = data.role.value
    if data.is_active is not None:
        user.is_active = data.is_active
    
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "phone": user.phone,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
        "is_active": user.is_active,
        "is_deleted": user.is_deleted,
        "auth_provider": user.auth_provider,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }


@router.get("/site-settings", response_model=SiteSettingsResponse)
async def get_site_settings(request: Request, db: Session = Depends(get_db)):
    """Get site settings (logo, hero slides)."""
    await require_admin(db, request)
    
    settings = db.query(SiteSettings).first()
    if not settings:
        settings = SiteSettings(
            id=str(uuid.uuid4()),
            logo_url=None,
            hero_slides=[]
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "id": settings.id,
        "logo_url": settings.logo_url,
        "hero_slides": settings.hero_slides or [],
        "created_at": settings.created_at.isoformat() if settings.created_at else None,
        "updated_at": settings.updated_at.isoformat() if settings.updated_at else None
    }


@router.put("/site-settings", response_model=SiteSettingsResponse)
async def update_site_settings(
    data: SiteSettingsUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update site settings (logo, hero slides)."""
    await require_admin(db, request)
    
    settings = db.query(SiteSettings).first()
    if not settings:
        settings = SiteSettings(
            id=str(uuid.uuid4()),
            logo_url=data.logo_url,
            hero_slides=[slide.model_dump() for slide in data.hero_slides] if data.hero_slides else []
        )
        db.add(settings)
    else:
        if data.logo_url is not None:
            settings.logo_url = data.logo_url
        if data.hero_slides is not None:
            settings.hero_slides = [slide.model_dump() for slide in data.hero_slides]
    
    db.commit()
    db.refresh(settings)
    
    return {
        "id": settings.id,
        "logo_url": settings.logo_url,
        "hero_slides": settings.hero_slides or [],
        "created_at": settings.created_at.isoformat() if settings.created_at else None,
        "updated_at": settings.updated_at.isoformat() if settings.updated_at else None
    }


# =============== REVIEWS MANAGEMENT ===============
@router.get("/reviews", response_model=PaginatedResponse)
async def get_all_reviews(
    request: Request,
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected"),
    product_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all reviews with optional filtering."""
    await require_admin(db, request)
    
    query = db.query(ProductReview).filter(ProductReview.is_deleted == False)
    
    if status == "pending":
        query = query.filter(ProductReview.is_approved == False)
    elif status == "approved":
        query = query.filter(ProductReview.is_approved == True)
    elif status == "rejected":
        query = query.filter(ProductReview.is_approved == False)
    
    if product_id:
        query = query.filter(ProductReview.product_id == product_id)
    
    if user_id:
        query = query.filter(ProductReview.user_id == user_id)
    
    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    
    skip = (page - 1) * page_size
    reviews = query.order_by(ProductReview.created_at.desc()).offset(skip).limit(page_size).all()
    
    review_list = []
    for review in reviews:
        user = db.query(User).filter(User.id == review.user_id).first()
        product = db.query(Product).filter(Product.id == review.product_id).first()
        
        review_list.append({
            "id": review.id,
            "product_id": review.product_id,
            "product_name": product.name if product else "Unknown",
            "product_slug": product.slug if product else "",
            "user_id": review.user_id,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "",
            "rating": review.rating,
            "comment": review.comment,
            "is_approved": review.is_approved,
            "created_at": review.created_at.isoformat() if review.created_at else None,
            "updated_at": review.updated_at.isoformat() if review.updated_at else None
        })
    
    return PaginatedResponse(
        items=review_list,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/reviews/{review_id}")
async def get_review(
    review_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get a specific review by ID."""
    await require_admin(db, request)
    
    review = db.query(ProductReview).filter(
        ProductReview.id == review_id,
        ProductReview.is_deleted == False
    ).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    user = db.query(User).filter(User.id == review.user_id).first()
    product = db.query(Product).filter(Product.id == review.product_id).first()
    is_verified = False
    if user:
        from routers.products import check_verified_purchase
        is_verified = check_verified_purchase(user.id, review.product_id, db)
    
    return {
        "id": review.id,
        "product_id": review.product_id,
        "product_name": product.name if product else "Unknown",
        "product_slug": product.slug if product else "",
        "user_id": review.user_id,
        "user_name": user.name if user else "Unknown",
        "user_email": user.email if user else "",
        "user_picture": user.picture if user else None,
        "rating": review.rating,
        "comment": review.comment,
        "is_approved": review.is_approved,
        "is_verified_purchase": is_verified,
        "created_at": review.created_at.isoformat() if review.created_at else None,
        "updated_at": review.updated_at.isoformat() if review.updated_at else None
    }


@router.put("/reviews/{review_id}")
async def update_review_status(
    review_id: str,
    is_approved: bool = Query(..., description="Set approval status"),
    request: Request,
    db: Session = Depends(get_db)
):
    """Approve or reject a review."""
    await require_admin(db, request)
    
    review = db.query(ProductReview).filter(
        ProductReview.id == review_id,
        ProductReview.is_deleted == False
    ).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.is_approved = is_approved
    db.commit()
    db.refresh(review)
    
    from routers.products import update_product_rating
    update_product_rating(review.product_id, db)
    
    return {
        "id": review.id,
        "is_approved": review.is_approved,
        "message": "Review approved" if is_approved else "Review rejected"
    }


@router.delete("/reviews/{review_id}")
async def delete_review(
    review_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Delete a review (admin can delete any review)."""
    await require_admin(db, request)
    
    review = db.query(ProductReview).filter(
        ProductReview.id == review_id,
        ProductReview.is_deleted == False
    ).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    product_id = review.product_id
    
    review.is_deleted = True
    db.commit()
    
    from routers.products import update_product_rating
    update_product_rating(product_id, db)
    
    return {"message": "Review deleted successfully"}
