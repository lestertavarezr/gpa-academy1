import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/tradinghub")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db() -> None:
    """Crea las tablas de paper trading si no existen.

    Igual que TypeORM con synchronize=true en el backend: valido para esta
    fase, deberia reemplazarse por migraciones (Alembic) antes de produccion.
    """
    from app.paper_trading import models  # noqa: F401  (registra las tablas en Base.metadata)

    Base.metadata.create_all(bind=engine)


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
