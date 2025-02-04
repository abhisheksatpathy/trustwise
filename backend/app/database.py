from sqlmodel import SQLModel, Session, create_engine
from typing import Generator
import os

# Get database URL from environment variable with fallback
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@db:5432/trustwise"  # Default docker-compose config
)

# Create engine with PostgreSQL-specific parameters
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Enable connection health checks
    pool_size=10,        # Maximum number of connections in pool
    max_overflow=20      # Maximum number of connections that can be created beyond pool_size
)

# Create all tables on startup
def init_db():
    SQLModel.metadata.create_all(engine)

# Session dependency for FastAPI
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()
