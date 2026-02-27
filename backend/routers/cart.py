"""Cart router using SQLite."""
from fastapi import APIRouter, HTTPException, Request, Depends
import uuid
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.schemas import (
    CartItemAdd, CartItemUpdate, CartItemResponse, CartResponse,
    ProductListResponse
)
from models.models import CartItem, Product, User
from routers.auth import get_current_user_from_request

router = APIRouter(prefix="/cart", tags=["Cart"])


def product_to_dict(product: Product):
    """Convert product model to dictionary."""
    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "short_description": product.short_description,
        "price": product.price,
        "compare_at_price": product.compare_at_price,
        "stock_quantity": product.stock_quantity,
        "images": product.images or [],
        "thumbnail": product.thumbnail,
        "is_active": product.is_active,
        "is_featured": product.is_featured,
        "category_id": product.category_id
    }


@router.get("", response_model=CartResponse)
async def get_cart(request: Request, db: Session = Depends(get_db)):
    """Get user's cart."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    cart_items = db.query(CartItem).filter(CartItem.user_id == user.id).order_by(CartItem.created_at.desc()).all()
    
    items = []
    subtotal = 0.0
    
    for item in cart_items:
        product = db.query(Product).filter(
            Product.id == item.product_id,
            Product.is_active == True,
            Product.is_deleted == False
        ).first()
        
        if product:
            item_response = {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": product_to_dict(product),
                "created_at": item.created_at.isoformat() if item.created_at else None
            }
            items.append(item_response)
            subtotal += product.price * item.quantity
    
    return CartResponse(
        items=items,
        subtotal=round(subtotal, 2),
        items_count=sum(i["quantity"] for i in items)
    )


@router.post("/add", response_model=CartItemResponse)
async def add_to_cart(
    data: CartItemAdd,
    request: Request,
    db: Session = Depends(get_db)
):
    """Add item to cart."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    product = db.query(Product).filter(
        Product.id == data.product_id,
        Product.is_active == True,
        Product.is_deleted == False
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.track_inventory and product.stock_quantity < data.quantity:
        if not product.allow_backorder:
            raise HTTPException(
                status_code=400,
                detail=f"Only {product.stock_quantity} items available"
            )
    
    existing = db.query(CartItem).filter(
        CartItem.user_id == user.id,
        CartItem.product_id == data.product_id
    ).first()
    
    if existing:
        existing.quantity += data.quantity
        db.commit()
        db.refresh(existing)
        cart_item = existing
    else:
        cart_item = CartItem(
            id=str(uuid.uuid4()),
            user_id=user.id,
            product_id=data.product_id,
            quantity=data.quantity
        )
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)
    
    return CartItemResponse(
        id=cart_item.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
        product=product_to_dict(product),
        created_at=cart_item.created_at.isoformat() if cart_item.created_at else None
    )


@router.put("/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: str,
    data: CartItemUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update cart item quantity."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if data.quantity == 0:
        db.delete(cart_item)
        db.commit()
        return {"message": "Item removed from cart"}
    
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    
    if product and product.track_inventory and product.stock_quantity < data.quantity:
        if not product.allow_backorder:
            raise HTTPException(
                status_code=400,
                detail=f"Only {product.stock_quantity} items available"
            )
    
    cart_item.quantity = data.quantity
    db.commit()
    db.refresh(cart_item)
    
    return CartItemResponse(
        id=cart_item.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
        product=product_to_dict(product) if product else None,
        created_at=cart_item.created_at.isoformat() if cart_item.created_at else None
    )


@router.delete("/{item_id}")
async def remove_from_cart(
    item_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Remove item from cart."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    
    return {"message": "Item removed from cart"}


@router.delete("")
async def clear_cart(request: Request, db: Session = Depends(get_db)):
    """Clear all items from cart."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    
    return {"message": "Cart cleared"}
