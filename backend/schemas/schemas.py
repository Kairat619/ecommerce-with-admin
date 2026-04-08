"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# =============== ENUMS ===============
class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


# =============== AUTH SCHEMAS ===============
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=255)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    auth_provider: str
    created_at: datetime


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = Field(None, pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    phone: Optional[str] = None
    picture: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


# =============== ADDRESS SCHEMAS ===============
class AddressBase(BaseModel):
    label: str = "Home"
    street: str
    city: str
    state: str
    postal_code: str
    country: str = "USA"
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressResponse(AddressBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    created_at: datetime


# =============== CATEGORY SCHEMAS ===============
class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[str] = None
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    slug: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CategoryWithProducts(CategoryResponse):
    products_count: int = 0


# =============== PRODUCT SCHEMAS ===============
class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    price: float = Field(gt=0)
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = None
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = None
    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = 10
    track_inventory: bool = True
    allow_backorder: bool = False
    images: List[str] = []
    thumbnail: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_featured: bool = False
    weight: Optional[float] = None
    dimensions: Optional[Dict[str, float]] = None
    attributes: Dict[str, Any] = {}
    category_id: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = None
    track_inventory: Optional[bool] = None
    allow_backorder: Optional[bool] = None
    images: Optional[List[str]] = None
    thumbnail: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    weight: Optional[float] = None
    dimensions: Optional[Dict[str, float]] = None
    attributes: Optional[Dict[str, Any]] = None
    category_id: Optional[str] = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    slug: str
    is_active: bool
    average_rating: float = 0.0
    review_count: int = 0
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    slug: str
    price: float
    compare_at_price: Optional[float] = None
    thumbnail: Optional[str] = None
    images: List[str] = []
    stock_quantity: int
    is_active: bool
    is_featured: bool
    average_rating: float = 0.0
    review_count: int = 0
    category_id: Optional[str] = None


class ProductWithCategory(ProductResponse):
    category: Optional[CategoryResponse] = None


# =============== CART SCHEMAS ===============
class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=0)


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    product_id: str
    quantity: int
    product: ProductListResponse
    created_at: datetime


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    subtotal: float
    items_count: int


# =============== ORDER SCHEMAS ===============
class ShippingAddress(BaseModel):
    street: str
    city: str
    state: str
    postal_code: str
    country: str = "USA"


class OrderCreate(BaseModel):
    shipping_address: ShippingAddress
    billing_address: Optional[ShippingAddress] = None
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    notes: Optional[str] = None
    payment_method: Optional[str] = None


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    product_id: Optional[str]
    product_name: str
    product_sku: Optional[str]
    product_image: Optional[str]
    quantity: int
    unit_price: float
    total_price: float


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    order_number: str
    user_id: Optional[str]
    status: OrderStatus
    subtotal: float
    tax_amount: float
    shipping_amount: float
    discount_amount: float
    total: float
    shipping_address: Dict[str, Any]
    billing_address: Optional[Dict[str, Any]]
    customer_email: str
    customer_phone: Optional[str]
    customer_name: str
    notes: Optional[str]
    payment_status: str
    payment_method: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    admin_notes: Optional[str] = None


# =============== PAGINATION ===============
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


# =============== ADMIN SCHEMAS ===============
class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class DashboardStats(BaseModel):
    total_orders: int
    total_revenue: float
    total_customers: int
    total_products: int
    pending_orders: int
    low_stock_products: int
    recent_orders: List[OrderResponse] = []


# =============== SEARCH ===============
class ProductSearchParams(BaseModel):
    q: Optional[str] = None
    category_id: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    in_stock: Optional[bool] = None
    is_featured: Optional[bool] = None
    sort_by: str = "created_at"
    sort_order: str = "desc"
    page: int = 1
    page_size: int = 20


# =============== SITE SETTINGS SCHEMAS ===============
class HeroSlide(BaseModel):
    image_url: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    link: Optional[str] = None


class SiteSettingsBase(BaseModel):
    logo_url: Optional[str] = None
    hero_slides: List[HeroSlide] = []


class SiteSettingsUpdate(BaseModel):
    logo_url: Optional[str] = None
    hero_slides: Optional[List[HeroSlide]] = None


class SiteSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    logo_url: Optional[str] = None
    hero_slides: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime


# =============== REVIEW SCHEMAS ===============
class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: Optional[str] = Field(None, max_length=500, description="Review comment (max 500 characters)")


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=500)


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    product_id: str
    user_id: str
    rating: int
    comment: Optional[str]
    is_approved: bool
    created_at: datetime
    updated_at: datetime


class ReviewWithUser(ReviewResponse):
    user_name: str
    user_picture: Optional[str] = None
    is_verified_purchase: bool = False


class ProductReviewsResponse(BaseModel):
    reviews: List[ReviewWithUser]
    average_rating: float
    review_count: int
    total_pages: int
    current_page: int
