from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Clinic, Practitioner, UserRole
from ..schemas import (
    PractitionerCreate,
    Practitioner as PractitionerSchema,
    ClinicCreate,
    Clinic as ClinicSchema
)
from ..security import get_current_admin, get_current_practitioner

router = APIRouter()

@router.post("/clinics/", response_model=ClinicSchema)
def create_clinic(
    *,
    db: Session = Depends(get_db),
    clinic_in: ClinicCreate,
    current_user: User = Depends(get_current_admin)
):
    """
    Create a new clinic (admin only).
    """
    clinic = Clinic(**clinic_in.model_dump())
    db.add(clinic)
    db.commit()
    db.refresh(clinic)
    return clinic

@router.get("/clinics/", response_model=List[ClinicSchema])
def list_clinics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_practitioner)
):
    """
    List all clinics (practitioners and admins).
    """
    return db.query(Clinic).filter(Clinic.is_active == True).all()

@router.post("/practitioners/", response_model=PractitionerSchema)
def create_practitioner(
    *,
    db: Session = Depends(get_db),
    practitioner_in: PractitionerCreate,
    current_user: User = Depends(get_current_admin)
):
    """
    Create a new practitioner (admin only).
    """
    # Verify the user exists and is not already a practitioner
    user = db.query(User).filter(User.id == practitioner_in.user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if user.practitioner:
        raise HTTPException(
            status_code=400,
            detail="User is already a practitioner"
        )
    
    # Verify the clinic exists
    clinic = db.query(Clinic).filter(Clinic.id == practitioner_in.clinic_id).first()
    if not clinic:
        raise HTTPException(
            status_code=404,
            detail="Clinic not found"
        )
    
    # Update user role
    user.role = UserRole.PRACTITIONER
    
    # Create practitioner
    practitioner = Practitioner(**practitioner_in.model_dump())
    db.add(practitioner)
    db.commit()
    db.refresh(practitioner)
    return practitioner

@router.get("/practitioners/", response_model=List[PractitionerSchema])
def list_practitioners(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_practitioner)
):
    """
    List all practitioners (practitioners and admins).
    """
    return db.query(Practitioner).filter(Practitioner.is_active == True).all()

@router.get("/practitioners/{practitioner_id}", response_model=PractitionerSchema)
def get_practitioner(
    practitioner_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_practitioner)
):
    """
    Get a specific practitioner by ID (practitioners and admins).
    """
    practitioner = db.query(Practitioner).filter(Practitioner.id == practitioner_id).first()
    if not practitioner:
        raise HTTPException(
            status_code=404,
            detail="Practitioner not found"
        )
    return practitioner
