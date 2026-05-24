from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class MedicalRecordCreate(BaseModel):
    patient_id: UUID
    diagnosis: str = Field(..., min_length=1, max_length=500)
    notes: Optional[str] = None
    symptoms: Optional[str] = None
    vitals: Optional[str] = None
    visit_date: Optional[datetime] = None


class MedicalRecordResponse(BaseModel):
    id: UUID
    patient_id: UUID
    diagnosis: str
    notes: Optional[str] = None
    symptoms: Optional[str] = None
    vitals: Optional[str] = None
    visit_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
