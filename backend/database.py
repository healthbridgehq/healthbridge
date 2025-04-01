from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool
import ssl
import os
import logging

logger = logging.getLogger(__name__)

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'healthbridge')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASS = os.getenv('DB_PASSWORD', 'postgres')

# Construct database URL with SSL requirements
SQLALCHEMY_DATABASE_URL = (
    f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    "?sslmode=verify-full"
    "&sslcert=/path/to/client-cert.pem"
    "&sslkey=/path/to/client-key.pem"
    "&sslrootcert=/path/to/server-ca.pem"
)

# Configure connection pooling
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,  # Maximum number of connections
    max_overflow=10,  # Maximum number of connections that can be created beyond pool_size
    pool_timeout=30,  # Seconds to wait before giving up on getting a connection
    pool_recycle=1800,  # Recycle connections after 30 minutes
    connect_args={
        "ssl": {
            "ssl_version": ssl.PROTOCOL_TLS,
            "cert_reqs": ssl.CERT_REQUIRED,
        }
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Add event listeners for connection monitoring
@event.listens_for(Engine, "connect")
def connect(dbapi_connection, connection_record):
    logger.info("New database connection established")

@event.listens_for(Engine, "checkout")
def checkout(dbapi_connection, connection_record, connection_proxy):
    logger.debug("Database connection checked out from pool")

@event.listens_for(Engine, "checkin")
def checkin(dbapi_connection, connection_record):
    logger.debug("Database connection returned to pool")

def get_db():
    db = SessionLocal()
    try:
        # Test the connection
        db.execute("SELECT 1")
        yield db
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise
    finally:
        db.close()
