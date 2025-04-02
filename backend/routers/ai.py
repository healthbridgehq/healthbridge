"""
AI-related endpoints for the HealthBridge API.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from database import get_db
from security import get_current_user
from models.user import User
from scripts.seed_data import generate_ai_insights

router = APIRouter()

@router.get("/health-insights")
async def get_health_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get AI-generated health insights for the current user."""
    try:
        # For demo purposes, we're using the generate_ai_insights function
        # In production, this would use a real AI model and real data
        insights = generate_ai_insights(current_user)
        return insights
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating health insights: {str(e)}"
        )

@router.post("/chat")
async def chat_with_ai(
    message: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Chat with the AI assistant."""
    try:
        # For demo purposes, we'll return a simple response
        # In production, this would use a real AI model
        responses = [
            "Based on your health records, your blood pressure has been well-managed recently.",
            "I recommend maintaining your current medication schedule and lifestyle changes.",
            "Your recent test results show improvement in key health indicators.",
            "Consider scheduling a follow-up appointment in the next 2-3 weeks.",
            "Remember to keep track of any new symptoms or concerns."
        ]
        return {
            "response": responses[hash(message["query"]) % len(responses)]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat message: {str(e)}"
        )
