from sqlalchemy import create_engine
from models import Base
from database import SQLALCHEMY_DATABASE_URL
import os
from dotenv import load_dotenv

def init_database():
    load_dotenv()
    
    # Create database engine
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_database()
