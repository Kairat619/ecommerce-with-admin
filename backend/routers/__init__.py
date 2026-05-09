# Routers module
from routers.auth import router as auth_router
from routers.categories import router as categories_router
from routers.products import router as products_router
from routers.blog import router as blog_router
from routers.cart import router as cart_router
from routers.orders import router as orders_router
from routers.admin import router as admin_router
from routers.user_reviews import router as user_reviews_router

__all__ = [
    'auth_router', 'categories_router', 'products_router',
    'blog_router', 'cart_router', 'orders_router', 'admin_router', 'user_reviews_router'
]
