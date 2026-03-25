import logging

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


logger = logging.getLogger(__name__)


def _build_engine():
    database_url = settings.DATABASE_URL or "sqlite:///./edumanage_dev.db"

    # Render usually provides postgresql:// URLs; map them to pg8000 since that is the installed driver.
    if database_url.startswith("postgresql://") and "+" not in database_url.split("://", 1)[0]:
        database_url = database_url.replace("postgresql://", "postgresql+pg8000://", 1)
    elif database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+pg8000://", 1)

    # SQLite path works without external services and is useful as a safe local fallback.
    if database_url.startswith("sqlite"):
        return create_engine(database_url, connect_args={"check_same_thread": False})

    try:
        primary_engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
        with primary_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return primary_engine
    except Exception as exc:
        fallback_url = "sqlite:///./edumanage_dev.db"
        logger.error("Primary database connection failed: %s", exc)
        logger.warning("Falling back to local SQLite database: %s", fallback_url)
        return create_engine(fallback_url, connect_args={"check_same_thread": False})

engine = _build_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
