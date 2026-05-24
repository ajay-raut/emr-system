"""Medical records API endpoints."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.record import MedicalRecord
from app.models.patient import Patient
from app.schemas.record import MedicalRecordCreate, MedicalRecordResponse
from app.schemas.pagination import PaginationParams, PaginatedResponse

router = APIRouter(prefix="/records", tags=["Medical Records"])


@router.get("/", response_model=PaginatedResponse[MedicalRecordResponse])
def list_records(
    pagination: PaginationParams = Depends(),
    patient_id: UUID = Query(None, description="Filter by patient ID"),
    db: Session = Depends(get_db)
):
    """List medical records with pagination, optionally filtered by patient."""
    query = db.query(MedicalRecord)
    if patient_id:
        query = query.filter(MedicalRecord.patient_id == patient_id)
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    records = query.order_by(MedicalRecord.visit_date.desc()).offset(pagination.skip).limit(pagination.limit).all()
    
    # Convert SQLAlchemy models to Pydantic models
    record_responses = [MedicalRecordResponse.model_validate(r) for r in records]
    
    return PaginatedResponse.create(
        items=record_responses,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size
    )


@router.get("/{record_id}", response_model=MedicalRecordResponse)
def get_record(record_id: UUID, db: Session = Depends(get_db)):
    """Get a specific medical record."""
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return record


@router.post("/", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(record_in: MedicalRecordCreate, db: Session = Depends(get_db)):
    """Create a new medical record / encounter."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == record_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    record = MedicalRecord(**record_in.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{record_id}", response_model=MedicalRecordResponse)
def update_record(record_id: UUID, record_in: MedicalRecordCreate, db: Session = Depends(get_db)):
    """Update a medical record."""
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    update_data = record_in.model_dump(exclude={"patient_id"}, exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(record_id: UUID, db: Session = Depends(get_db)):
    """Delete a medical record."""
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    db.delete(record)
    db.commit()
    return None
