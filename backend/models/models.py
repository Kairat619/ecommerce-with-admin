"""SQLAlchemy models for the e-commerce system."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime, 
    ForeignKey, Enum as SQLEnum, JSON, Index
)
from sqlalchemy.orm import relationship
import enum

from config.database import Base


def utc_now():
    return datetime.now(timezone.utc)


def generate_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Nullable for OAuth users
    name = Column(String(255), nullable=False)
    picture = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    auth_provider = Column(String(50), default="local")  # local, google
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    # Relationships
    addresses = relationship("Address", back_populates="user", lazy="selectin")
    orders = relationship("Order", back_populates="user", lazy="selectin")
    cart_items = relationship("CartItem", back_populates="user", lazy="selectin")
    refresh_tokens = relationship("RefreshToken", back_populates="user", lazy="selectin")
    
    __table_args__ = (
        Index('ix_users_email_active', 'email', 'is_active'),
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(500), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    
    user = relationship("User", back_populates="refresh_tokens")


class Address(Base):
    __tablename__ = "addresses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(50), default="Home")  # Home, Work, etc.
    street = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), default="USA")
    is_default = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    user = relationship("User", back_populates="addresses")


class Category(Base):
    __tablename__ = "categories"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(120), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    parent_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    # Self-referential relationship
    parent = relationship("Category", remote_side=[id], backref="children")
    products = relationship("Product", back_populates="category", lazy="selectin")
    
    __table_args__ = (
        Index('ix_categories_slug_active', 'slug', 'is_active'),
    )


class Product(Base):
    __tablename__ = "products"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(280), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)  # Original price for discounts
    cost_price = Column(Float, nullable=True)  # For profit calculations
    sku = Column(String(100), unique=True, nullable=True, index=True)
    barcode = Column(String(100), nullable=True)
    
    # Inventory
    stock_quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=10)
    track_inventory = Column(Boolean, default=True)
    allow_backorder = Column(Boolean, default=False)
    
    # Media
    images = Column(JSON, default=list)  # List of image URLs
    thumbnail = Column(String(500), nullable=True)
    
    # SEO
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(String(500), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    
    # Attributes
    weight = Column(Float, nullable=True)
    dimensions = Column(JSON, nullable=True)  # {length, width, height}
    attributes = Column(JSON, default=dict)  # Custom attributes
    
    # Category
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product", lazy="selectin")
    cart_items = relationship("CartItem", back_populates="product", lazy="selectin")
    
    __table_args__ = (
        Index('ix_products_category_active', 'category_id', 'is_active'),
        Index('ix_products_featured', 'is_featured', 'is_active'),
    )


class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1)
    
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")
    
    __table_args__ = (
        Index('ix_cart_user_product', 'user_id', 'product_id', unique=True),
    )


class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Status
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    
    # Pricing
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0)
    shipping_amount = Column(Float, default=0)
    discount_amount = Column(Float, default=0)
    total = Column(Float, nullable=False)
    
    # Shipping info
    shipping_address = Column(JSON, nullable=False)
    billing_address = Column(JSON, nullable=True)
    
    # Contact
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=True)
    customer_name = Column(String(255), nullable=False)
    
    # Notes
    notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # Payment (placeholder for future integration)
    payment_status = Column(String(50), default="pending")
    payment_method = Column(String(50), nullable=True)
    payment_id = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", lazy="selectin", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('ix_orders_user_status', 'user_id', 'status'),
        Index('ix_orders_created', 'created_at'),
    )


class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    
    # Snapshot of product at time of order
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100), nullable=True)
    product_image = Column(String(500), nullable=True)
    
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=utc_now)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
