"""Appointments API endpoints."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.schemas.pagination import PaginationParams, PaginatedResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("/", response_model=PaginatedResponse[AppointmentResponse])
def list_appointments(
    pagination: PaginationParams = Depends(),
    patient_id: UUID = Query(None, description="Filter by patient ID"),
    status_filter: str = Query(None, description="Filter by appointment status"),
    db: Session = Depends(get_db)
):
    """List appointments with pagination and optional filtering by patient and status."""
    query = db.query(Appointment)
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    appointments = query.order_by(Appointment.appointment_date.desc()).offset(pagination.skip).limit(pagination.limit).all()
    
    # Convert SQLAlchemy models to Pydantic models
    appointment_responses = [AppointmentResponse.model_validate(a) for a in appointments]
    
    return PaginatedResponse.create(
        items=appointment_responses,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: UUID, db: Session = Depends(get_db)):
    """Get a specific appointment."""
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return apt


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(apt_in: AppointmentCreate, db: Session = Depends(get_db)):
    """Schedule a new appointment."""
    patient = db.query(Patient).filter(Patient.id == apt_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    apt = Appointment(**apt_in.model_dump())
    db.add(apt)
    db.commit()
    db.refresh(apt)
    return apt


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(appointment_id: UUID, apt_in: AppointmentUpdate, db: Session = Depends(get_db)):
    """Update an appointment (reschedule, change status, etc.)."""
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    update_data = apt_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(apt, field, value)

    db.commit()
    db.refresh(apt)
    return apt


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: UUID, db: Session = Depends(get_db)):
    """Cancel/delete an appointment."""
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(apt)
    db.commit()
    return None
