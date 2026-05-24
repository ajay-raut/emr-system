from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorResponse, DoctorUpdate
from app.schemas.pagination import PaginationParams, PaginatedResponse
from uuid import UUID

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/", response_model=PaginatedResponse[DoctorResponse])
def get_doctors(
    pagination: PaginationParams = Depends(),
    search: str = "",
    db: Session = Depends(get_db)
):
    """List all doctors with pagination and optional search by name."""
    query = db.query(Doctor)
    if search:
        query = query.filter(Doctor.full_name.ilike(f"%{search}%"))
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    doctors = query.order_by(Doctor.created_at.desc()).offset(pagination.skip).limit(pagination.limit).all()
    
    # Convert SQLAlchemy models to Pydantic models
    doctor_responses = [DoctorResponse.model_validate(d) for d in doctors]
    
    return PaginatedResponse.create(
        items=doctor_responses,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size
    )

@router.post("/", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(doctor_in: DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = Doctor(**doctor_in.model_dump())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.put("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(doctor_id: UUID, doctor_in: DoctorUpdate, db: Session = Depends(get_db)):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    update_data = doctor_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_doctor, field, value)
        
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor(doctor_id: UUID, db: Session = Depends(get_db)):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(db_doctor)
    db.commit()
    return None
