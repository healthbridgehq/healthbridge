from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from ..database import get_db
from ..models import HealthRecord
from ..services.ai_analysis import PrivacyPreservingAnalysis
from ..security import get_current_user

router = APIRouter()
analyzer = PrivacyPreservingAnalysis()

@router.get("/health-trends")
async def get_health_trends(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> Dict[str, any]:
    """
    Get privacy-preserving insights from health records.
    """
    # Get user's health records
    records = db.query(HealthRecord).filter(
        HealthRecord.user_id == current_user.id
    ).all()
    
    if not records:
        raise HTTPException(
            status_code=404,
            detail="No health records found for analysis"
        )
    
    # Analyze with privacy guarantees
    insights = await analyzer.analyze_health_trends(records)
    
    return {
        "status": "success",
        "data": insights,
        "privacy_notice": (
            "Analysis performed with differential privacy guarantees. "
            "Individual data remains protected."
        )
    }
