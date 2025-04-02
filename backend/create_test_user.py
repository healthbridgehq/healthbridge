from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models.user import User
from security import get_password_hash

def create_test_user():
    db = SessionLocal()
    try:
        # Check if test user already exists
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if test_user:
            print("Test user already exists!")
            return

        # Create test user
        test_user = User(
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test User",
            is_active=True,
            is_superuser=True
        )
        db.add(test_user)
        db.commit()
        print("Test user created successfully!")
        print("\nLogin credentials:")
        print("Email: test@example.com")
        print("Password: testpassword")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
