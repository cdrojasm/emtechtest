from app.core.config import settings
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from contextlib import contextmanager
import time

DB_URL = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
print("DB_URL", DB_URL, flush=True)
engine = None
for _ in range(6):  # Retry 6 times (5 seconds each) for a total of 30 seconds
    try:
        engine = create_engine(DB_URL, echo=False)
        # Try to connect to the database to ensure it's up
        connection = engine.connect()
        connection.close()
        break
    except OperationalError:
        print("Database is not ready, waiting for 5 seconds...")
        time.sleep(5)
else:
    raise Exception("Database is not available after 30 seconds of retrying")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
        
def get_db():
    db = SessionLocal()
    print("using database: {}".format(DB_URL), flush=True)
    try:
        yield db
    finally:
        db.close()
        
@contextmanager
def get_db_task():
    db = SessionLocal()
    print("using database: {}".format(DB_URL), flush=True)
    try:
        yield db
    finally:
        db.close()