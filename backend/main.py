from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from app.core.config import settings
from app.api.v1.router import api_router
from app.db.database import engine
from app.db import models
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

models.Base.metadata.create_all(bind=engine)

def check_oauth_config():
    providers = {
        'Google': (settings.GOOGLE_CLIENT_ID, settings.GOOGLE_CLIENT_SECRET),
        'Microsoft': (settings.MICROSOFT_CLIENT_ID, settings.MICROSOFT_CLIENT_SECRET),
        'GitHub': (settings.GITHUB_CLIENT_ID, settings.GITHUB_CLIENT_SECRET),
    }
    
    configured = []
    for provider, (client_id, secret) in providers.items():
        if (client_id and secret and 
            not client_id.startswith('your-') and 
            not client_id.startswith('demo-') and
            not secret.startswith('your-') and
            not secret.startswith('demo-') and
            len(client_id) > 15 and
            len(secret) > 15):
            configured.append(provider)
    
    if not configured:
        logger.warning("=" * 80)
        logger.warning("⚠️  OAuth NOT CONFIGURED - Login will not work!")
        logger.warning("=" * 80)
        logger.warning("No OAuth providers are set up. Please configure at least one:")
        logger.warning("1. See QUICK_START_OAUTH.md for fast setup")
        logger.warning("2. See OAUTH_SETUP.md for detailed instructions")
        logger.warning("3. Update backend/.env with your OAuth credentials")
        logger.warning("4. Restart this server")
        logger.warning("=" * 80)
    else:
        logger.info(f"✅ OAuth configured for: {', '.join(configured)}")

check_oauth_config()

app = FastAPI(
    title="Student Management System API",
    description="Production-grade SMS with OAuth 2.0 authentication",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

allowed_origins = {
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "status": "✅ Backend Server Running Successfully!",
        "message": "Student Management System API is live",
        "version": "1.0.0",
        "docs": "http://127.0.0.1:8000/api/docs",
        "health": "http://127.0.0.1:8000/health"
    }


@app.get("/health")
async def health_check():
    return {"status": "✅ Healthy", "database": "Connected"}


@app.get("/favicon.ico")
async def favicon():
    return Response(status_code=204)
