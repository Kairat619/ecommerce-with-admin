"""User reviews router."""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from config.database import get_db
from schemas.schemas import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewWithUser, ProductReviewsResponse
from models.models import ProductReview, Product, User
from routers.products import update_product_rating, check_verified_purchase
from utils.security import get_current_user

router = APIRouter(prefix="/users", tags=["User Reviews"])


@router.get("/me/reviews", response_model=ProductReviewsResponse)
async def get_my_reviews(
    product_slug: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's reviews."""
    query = db.query(ProductReview).filter(
        ProductReview.user_id == current_user.id,
        ProductReview.is_deleted == False
    ).order_by(ProductReview.created_at.desc())
    
    if product_slug:
        product = db.query(Product).filter(Product.slug == product_slug).first()
        if product:
            query = query.filter(ProductReview.product_id == product.id)
    
    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    
    skip = (page - 1) * page_size
    reviews = query.offset(skip).limit(page_size).all()
    
    review_list = []
    for review in reviews:
        product = db.query(Product).filter(Product.id == review.product_id).first()
        is_verified = check_verified_purchase(current_user.id, review.product_id, db)
        
        review_list.append({
            "id": review.id,
            "product_id": review.product_id,
            "user_id": review.user_id,
            "rating": review.rating,
            "comment": review.comment,
            "is_approved": review.is_approved,
            "created_at": review.created_at.isoformat() if review.created_at else None,
            "updated_at": review.updated_at.isoformat() if review.updated_at else None,
            "user_name": current_user.name,
            "user_picture": current_user.picture,
            "is_verified_purchase": is_verified
        })
    
    # Calculate average from user's reviews
    all_user_reviews = db.query(ProductReview).filter(
        ProductReview.user_id == current_user.id,
        ProductReview.is_approved == True,
        ProductReview.is_deleted == False
    ).all()
    
    avg_rating = 0
    if all_user_reviews:
        avg_rating = sum(r.rating for r in all_user_reviews) / len(all_user_reviews)
    
    return ProductReviewsResponse(
        reviews=review_list,
        average_rating=round(avg_rating, 1),
        review_count=len(all_user_reviews),
        total_pages=total_pages,
        current_page=page
    )


@router.post("/me/reviews", response_model=ReviewResponse)
async def create_review(
    product_slug: str,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a review for a product."""
    # Get product
    product = db.query(Product).filter(Product.slug == product_slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed this product
    existing = db.query(ProductReview).filter(
        ProductReview.user_id == current_user.id,
        ProductReview.product_id == product.id,
        ProductReview.is_deleted == False
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this product. Please edit your existing review.")
    
    # Create review
    review = ProductReview(
        product_id=product.id,
        user_id=current_user.id,
        rating=review_data.rating,
        comment=review_data.comment,
        is_approved=False  # Requires moderation
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return ReviewResponse(
        id=review.id,
        product_id=review.product_id,
        user_id=review.user_id,
        rating=review.rating,
        comment=review.comment,
        is_approved=review.is_approved,
        created_at=review.created_at,
        updated_at=review.updated_at
    )


@router.put("/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update own review."""
    review = db.query(ProductReview).filter(
        ProductReview.id == review_id,
        ProductReview.user_id == current_user.id,
        ProductReview.is_deleted == False
    ).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Update fields
    if review_data.rating is not None:
        review.rating = review_data.rating
    if review_data.comment is not None:
        review.comment = review_data.comment
    
    # Reset approval status on edit (requires re-moderation)
    review.is_approved = False
    
    db.commit()
    db.refresh(review)
    
    # Update product rating
    update_product_rating(review.product_id, db)
    
    return ReviewResponse(
        id=review.id,
        product_id=review.product_id,
        user_id=review.user_id,
        rating=review.rating,
        comment=review.comment,
        is_approved=review.is_approved,
        created_at=review.created_at,
        updated_at=review.updated_at
    )


@router.delete("/reviews/{review_id}")
async def delete_review(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete own review."""
    review = db.query(ProductReview).filter(
        ProductReview.id == review_id,
        ProductReview.user_id == current_user.id,
        ProductReview.is_deleted == False
    ).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    product_id = review.product_id
    
    # Soft delete
    review.is_deleted = True
    db.commit()
    
    # Update product rating
    update_product_rating(product_id, db)
    
    return {"message": "Review deleted successfully"}


@router.get("/reviews/{review_id}", response_model=ReviewWithUser)
async def get_my_review(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific review by ID."""
    review = db.query(ProductReview).filter(
        ProductReview.id == review_id,
        ProductReview.user_id == current_user.id,
        ProductReview.is_deleted == False
    ).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    product = db.query(Product).filter(Product.id == review.product_id).first()
    is_verified = check_verified_purchase(current_user.id, review.product_id, db)
    
    return ReviewWithUser(
        id=review.id,
        product_id=review.product_id,
        user_id=review.user_id,
        rating=review.rating,
        comment=review.comment,
        is_approved=review.is_approved,
        created_at=review.created_at,
        updated_at=review.updated_at,
        user_name=current_user.name,
        user_picture=current_user.picture,
        is_verified_purchase=is_verified
    )