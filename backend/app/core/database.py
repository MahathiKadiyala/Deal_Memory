from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from app.core.config import settings


class Base(DeclarativeBase):
    pass


# SQLAlchemy 2.x engine using psycopg3
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=(settings.environment == "development"),
    connect_args={"connect_timeout": 10},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a SQLAlchemy database session.
    Closes the session automatically upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
