import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
import app.core.database as db_module
from app.db.seeds import seed_db
from app.main import app

# Create a temporary file SQLite database for testing isolation
TEST_DB_FILE = "./test_temp.db"
test_engine = create_engine(
    f"sqlite:///{TEST_DB_FILE}",
    connect_args={"check_same_thread": False}
)

# Create a test session maker
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Patch the database module's engine and SessionLocal globally
db_module.engine = test_engine
db_module.SessionLocal = TestingSessionLocal

# Override the get_db dependency in the FastAPI application
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

from app.core.database import get_db
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    # Build schema
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
    yield
    # Dispose of connection pool to release file locks before deleting
    test_engine.dispose()
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass
