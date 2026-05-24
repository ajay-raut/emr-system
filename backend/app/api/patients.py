"""Patient management API endpoints."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.schemas.pagination import PaginationParams, PaginatedResponse

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/", response_model=PaginatedResponse[PatientResponse])
def list_patients(
    pagination: PaginationParams = Depends(),
    search: str = "",
    db: Session = Depends(get_db)
):
    """List all patients with pagination and optional search by name."""
    query = db.query(Patient)
    if search:
        query = query.filter(
            (Patient.first_name.ilike(f"%{search}%")) |
            (Patient.last_name.ilike(f"%{search}%"))
        )
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    patients = query.order_by(Patient.created_at.desc()).offset(pagination.skip).limit(pagination.limit).all()
    
    # Convert SQLAlchemy models to Pydantic models
    patient_responses = [PatientResponse.model_validate(p) for p in patients]
    
    return PaginatedResponse.create(
        items=patient_responses,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size
    )


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: UUID, db: Session = Depends(get_db)):
    """Get a specific patient by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient profile."""
    patient = Patient(**patient_in.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    
    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(patient_id: UUID, patient_in: PatientUpdate, db: Session = Depends(get_db)):
    """Update an existing patient profile."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    update_data = patient_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(patient_id: UUID, db: Session = Depends(get_db)):
    """Delete a patient and all associated records."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
    
    return None
