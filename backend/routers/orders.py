"""Orders router using SQLite."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Request, Depends
import uuid
from sqlalchemy.orm import Session

from config.database import get_db
from schemas.schemas import (
    OrderCreate, OrderResponse, OrderItemResponse, PaginatedResponse
)
from models.models import Order, OrderItem, CartItem, Product, User
from routers.auth import get_current_user_from_request

router = APIRouter(prefix="/orders", tags=["Orders"])


def order_to_dict(order: Order, include_items: bool = True):
    """Convert order model to dictionary."""
    data = {
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
        "updated_at": order.updated_at.isoformat() if order.updated_at else None
    }
    if include_items:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all() if 'db' in dir() else []
        data["items"] = [
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
            for item in order.items
        ] if hasattr(order, 'items') else []
    return data


@router.post("", response_model=OrderResponse)
async def create_order(
    data: OrderCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create order from cart."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    cart_items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    subtotal = 0.0
    order_items_data = []
    
    for cart_item in cart_items:
        product = db.query(Product).filter(
            Product.id == cart_item.product_id,
            Product.is_active == True,
            Product.is_deleted == False
        ).first()
        
        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Product {cart_item.product_id} is not available"
            )
        
        if product.track_inventory and product.stock_quantity < cart_item.quantity:
            if not product.allow_backorder:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.name}"
                )
        
        item_total = product.price * cart_item.quantity
        subtotal += item_total
        
        order_items_data.append({
            "product": product,
            "quantity": cart_item.quantity,
            "unit_price": product.price,
            "total_price": item_total
        })
    
    tax_rate = 0.08
    tax_amount = round(subtotal * tax_rate, 2)
    shipping_amount = 0.0 if subtotal >= 50 else 5.99
    total = round(subtotal + tax_amount + shipping_amount, 2)
    
    order_id = str(uuid.uuid4())
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    order = Order(
        id=order_id,
        order_number=order_number,
        user_id=user.id,
        status="pending",
        subtotal=round(subtotal, 2),
        tax_amount=tax_amount,
        shipping_amount=shipping_amount,
        discount_amount=0,
        total=total,
        shipping_address=data.shipping_address.model_dump() if data.shipping_address else {},
        billing_address=data.billing_address.model_dump() if data.billing_address else None,
        customer_email=data.customer_email,
        customer_phone=data.customer_phone,
        customer_name=data.customer_name,
        notes=data.notes,
        admin_notes=None,
        payment_status="pending",
        payment_method=data.payment_method,
        payment_id=None
    )
    db.add(order)
    db.flush()
    
    for item_data in order_items_data:
        product = item_data["product"]
        order_item = OrderItem(
            id=str(uuid.uuid4()),
            order_id=order_id,
            product_id=product.id,
            product_name=product.name,
            product_sku=product.sku,
            product_image=product.thumbnail or (product.images[0] if product.images else None),
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            total_price=item_data["total_price"]
        )
        db.add(order_item)
        
        if product.track_inventory:
            product.stock_quantity -= item_data["quantity"]
    
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    db.refresh(order)
    
    result = {
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
                "id": str(uuid.uuid4()),
                "order_id": order_id,
                "product_id": item_data["product"].id,
                "product_name": item_data["product"].name,
                "product_sku": item_data["product"].sku,
                "product_image": item_data["product"].thumbnail or (item_data["product"].images[0] if item_data["product"].images else None),
                "quantity": item_data["quantity"],
                "unit_price": item_data["unit_price"],
                "total_price": item_data["total_price"],
                "created_at": order.created_at.isoformat() if order.created_at else None
            }
            for item_data in order_items_data
        ]
    }
    
    return result


@router.get("", response_model=PaginatedResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """List user's orders."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    query = db.query(Order).filter(Order.user_id == user.id)
    
    total = query.count()
    
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    result = []
    for order in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        order_dict = {
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
        result.append(order_dict)
    
    return PaginatedResponse(
        items=result,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size if total > 0 else 1
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get order details."""
    user = await get_current_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user.id
    ).first()
    
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
