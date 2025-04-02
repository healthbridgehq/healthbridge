from database import engine
from models.user import Base
from models.health_record import HealthRecord
from models.consent import ConsentRecord
from models.practitioner import Practitioner
from models.clinic import Clinic

def create_tables():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()
    print("Database tables created successfully!")
