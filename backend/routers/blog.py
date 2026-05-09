"""Blog router for public blog post endpoints."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from config.database import get_db
from schemas.schemas import BlogPostResponse, PaginatedResponse
from models.models import BlogPost, User

router = APIRouter(prefix="/blog", tags=["Blog"])


def blog_to_dict(post: BlogPost, include_author: bool = False):
    data = {
        "id": post.id,
        "title": post.title,
        "slug": post.slug,
        "content": post.content,
        "excerpt": post.excerpt,
        "image_url": post.image_url,
        "author_id": post.author_id,
        "author_name": post.author.name if post.author else None,
        "is_published": post.is_published,
        "published_at": post.published_at.isoformat() if post.published_at else None,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "updated_at": post.updated_at.isoformat() if post.updated_at else None,
    }
    return data


@router.get("", response_model=PaginatedResponse)
async def list_posts(
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """List published blog posts."""
    query = db.query(BlogPost).filter(
        BlogPost.is_published == True,
        BlogPost.is_deleted == False,
    )

    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(BlogPost.title.ilike(search), BlogPost.excerpt.ilike(search))
        )

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)

    posts = (
        query.order_by(BlogPost.published_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[blog_to_dict(p) for p in posts],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{slug}", response_model=BlogPostResponse)
async def get_post(slug: str, db: Session = Depends(get_db)):
    """Get a single published blog post by slug."""
    post = db.query(BlogPost).filter(
        BlogPost.slug == slug,
        BlogPost.is_published == True,
        BlogPost.is_deleted == False,
    ).first()

    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    return blog_to_dict(post, include_author=True)
