"""
Seed script to populate the database with example data.
"""
import sys
import os
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.user import User
from models.health_record import HealthRecord
from models.consent import ConsentRecord
from database import SessionLocal, engine
from sqlalchemy.orm import Session

def create_test_user(db: Session) -> User:
    """Create a test user if it doesn't exist."""
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        test_user = User(
            email="test@example.com",
            full_name="Test User",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNhyZ5cQrh2HK",  # Password: test123
            is_patient=True,
            age=35,
            gender="Male",
            conditions=["Hypertension", "Type 2 Diabetes"]
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
    return test_user

def create_health_records(db: Session, user: User) -> List[HealthRecord]:
    """Create sample health records for the user."""
    records = []
    record_types = ["consultation", "test", "prescription"]
    providers = ["Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown"]
    
    # Create 10 records over the past year
    for i in range(10):
        date = datetime.now() - timedelta(days=random.randint(0, 365))
        record = HealthRecord(
            user_id=user.id,
            record_type=random.choice(record_types),
            data={
                "title": f"Health Record {i+1}",
                "description": f"Sample health record description {i+1}",
                "date": date.isoformat(),
                "provider": random.choice(providers),
                "status": "active",
                "vitals": {
                    "blood_pressure": f"{random.randint(110, 140)}/{random.randint(70, 90)}",
                    "heart_rate": random.randint(60, 100),
                    "temperature": round(random.uniform(36.5, 37.5), 1)
                }
            }
        )
        records.append(record)
    
    db.add_all(records)
    db.commit()
    return records

def generate_ai_insights(user: User) -> Dict[str, Any]:
    """Generate sample AI insights data."""
    current_date = datetime.now()
    dates = [(current_date - timedelta(days=x)).strftime("%Y-%m-%d") for x in range(30, 0, -1)]
    
    return {
        "clinicalInsights": {
            "metrics": [
                {"label": "Blood Pressure", "value": 128, "unit": "mmHg", "trend": 5, "status": "warning"},
                {"label": "Blood Sugar", "value": 95, "unit": "mg/dL", "trend": -2, "status": "good"},
                {"label": "Heart Rate", "value": 72, "unit": "bpm", "trend": 0, "status": "good"}
            ],
            "trends": [{"date": date, "value": random.randint(120, 135)} for date in dates]
        },
        "populationHealth": {
            "riskDistribution": [
                {"name": "Low Risk", "value": 60, "color": "#00C49F"},
                {"name": "Medium Risk", "value": 30, "color": "#FFBB28"},
                {"name": "High Risk", "value": 10, "color": "#FF8042"}
            ],
            "trends": [{"date": date, "value": random.randint(80, 95)} for date in dates],
            "segments": [
                {"name": "18-30", "value": 25},
                {"name": "31-50", "value": 45},
                {"name": "51-70", "value": 20},
                {"name": "70+", "value": 10}
            ]
        },
        "operationalMetrics": {
            "performance": [
                {"label": "Appointments", "value": 156, "trend": 8, "status": "good"},
                {"label": "Response Time", "value": 24, "unit": "hrs", "trend": -5, "status": "good"},
                {"label": "Patient Satisfaction", "value": 4.8, "unit": "/5", "trend": 3, "status": "good"}
            ],
            "efficiency": [{"date": date, "value": random.randint(85, 98)} for date in dates]
        },
        "recommendations": [
            {
                "title": "Schedule Blood Pressure Check",
                "description": "Your blood pressure readings show an upward trend. Consider scheduling a follow-up appointment.",
                "priority": "warning",
                "category": "Follow-up"
            },
            {
                "title": "Lifestyle Modification",
                "description": "Your blood sugar levels are well-controlled. Continue with your current diet and exercise routine.",
                "priority": "info",
                "category": "Lifestyle"
            }
        ]
    }

def main():
    """Main function to seed the database."""
    db = SessionLocal()
    try:
        # Create test user
        user = create_test_user(db)
        print(f"Created test user: {user.email}")
        
        # Create health records
        records = create_health_records(db, user)
        print(f"Created {len(records)} health records")
        
        # Generate and store AI insights
        insights = generate_ai_insights(user)
        # In a real application, you would store this in a database
        # For now, we'll just print it
        print("Generated AI insights")
        
        print("Seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
