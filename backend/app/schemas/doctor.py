from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class DoctorBase(BaseModel):
    full_name: str
    specialization: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class DoctorResponse(DoctorBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
