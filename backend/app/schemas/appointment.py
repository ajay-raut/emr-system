from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class AppointmentCreate(BaseModel):
    patient_id: UUID
    appointment_date: datetime
    reason: str = Field(..., min_length=1, max_length=500)
    doctor_name: Optional[str] = "Dr. Smith"
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    reason: Optional[str] = None
    status: Optional[str] = None
    doctor_name: Optional[str] = None
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: UUID
    patient_id: UUID
    appointment_date: datetime
    reason: str
    status: str
    doctor_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
