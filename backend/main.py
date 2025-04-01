from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from typing import Optional, Dict
from sqlalchemy.orm import Session
import uvicorn
import os

from .routers import auth, ai_insights, practitioners, privacy
from .middleware.security import SecurityMiddleware
from .middleware.waf import WAFMiddleware
from .security.testing import SecurityTester
from .database import get_db

# Initialize FastAPI with security configurations
app = FastAPI(
    title="HealthBridge API",
    description="Privacy-first, AI-powered healthcare data platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_oauth2_redirect_url="/docs/oauth2-redirect",
    swagger_ui_init_oauth={
        "clientId": "healthbridge-swagger",
        "appName": "HealthBridge API Docs",
        "usePkceWithAuthorizationCodeGrant": True,
    }
)

# Security Middleware Stack
app.add_middleware(SecurityMiddleware)
app.add_middleware(WAFMiddleware)

# Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
)

# Configure CORS with strict settings
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Request-ID",
        "X-Real-IP"
    ],
    expose_headers=["X-Request-ID"],
    max_age=3600
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(practitioners.router, prefix="/practitioners", tags=["practitioners"])
app.include_router(privacy.router, prefix="/privacy", tags=["privacy"])
app.include_router(ai_insights.router, prefix="/ai", tags=["ai-insights"])

@app.get("/")
async def root():
    return {
        "name": "HealthBridge API",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/security/test", tags=["security"])
async def run_security_tests(db: Session = Depends(get_db)):
    """Run security tests and return results. Admin only."""
    tester = SecurityTester(app, db)
    results = tester.run_all_tests()
    return JSONResponse(content=results)

@app.get("/security/stats", tags=["security"])
async def get_security_stats(request: Request, db: Session = Depends(get_db)) -> Dict:
    """Get security-related statistics. Admin only."""
    waf = request.app.middleware_stack.middlewares[0]
    return {
        "blocked_ips": len(waf.blocked_ips),
        "recent_violations": dict(waf.violation_counts),
        "rate_limited_ips": [
            ip for ip, count in waf.request_counts.items()
            if len(count) > waf.max_requests_per_min
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
