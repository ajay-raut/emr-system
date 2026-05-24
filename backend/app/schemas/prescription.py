from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class PrescriptionItemCreate(BaseModel):
    medication_name: str = Field(..., min_length=1, max_length=300)
    dosage: str = Field(..., min_length=1, max_length=100)
    frequency: str = Field(..., min_length=1, max_length=100)
    duration: str = Field(..., min_length=1, max_length=100)
    instructions: Optional[str] = None


class PrescriptionItemResponse(BaseModel):
    id: UUID
    medication_name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

    class Config:
        from_attributes = True


class PrescriptionCreate(BaseModel):
    patient_id: UUID
    doctor_name: str = Field(default="Dr. Smith", max_length=200)
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    items: list[PrescriptionItemCreate] = Field(..., min_length=1)


class PrescriptionResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_name: str
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    items: list[PrescriptionItemResponse] = []

    class Config:
        from_attributes = True
