"""Rate limiting middleware for protecting auth endpoints."""
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)


class RateLimiter(BaseHTTPMiddleware):
    """Simple in-memory rate limiter for auth endpoints."""
    
    def __init__(self, app, max_requests: int = 5, window_seconds: int = 300):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP from request."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _is_rate_limited(self, key: str) -> tuple[bool, int]:
        """Check if a key is rate limited. Returns (is_limited, seconds_until_reset)."""
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(seconds=self.window_seconds)
        
        # Clean old requests
        self.requests[key] = [ts for ts in self.requests[key] if ts > cutoff]
        
        if len(self.requests[key]) >= self.max_requests:
            oldest = min(self.requests[key])
            reset_time = oldest + timedelta(seconds=self.window_seconds)
            seconds_until_reset = int((reset_time - now).total_seconds())
            return True, max(1, seconds_until_reset)
        
        self.requests[key].append(now)
        return False, 0
    
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        # Only rate limit auth endpoints
        auth_paths = ["/api/auth/register", "/api/auth/login"]
        
        if any(path.startswith(p) for p in auth_paths):
            client_ip = self._get_client_ip(request)
            key = f"{client_ip}:{path}"
            
            is_limited, retry_after = self._is_rate_limited(key)
            
            if is_limited:
                logger.warning(f"Rate limit exceeded for {client_ip} on {path}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please try again later.",
                    headers={"Retry-After": str(retry_after)}
                )
        
        response = await call_next(request)
        return response


def check_honeypot(data: dict) -> bool:
    """Check if honeypot field was filled (indicates bot)."""
    honeypot_field = data.get("website", "") if data else ""
    return bool(honeypot_field.strip())
