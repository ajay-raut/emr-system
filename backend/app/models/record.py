import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    diagnosis = Column(String(500), nullable=False)
    notes = Column(Text, nullable=True)
    symptoms = Column(Text, nullable=True)
    vitals = Column(String(500), nullable=True)  # JSON-like string for BP, Temp, etc.
    visit_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="medical_records")

    def __repr__(self):
        return f"<MedicalRecord {self.id} - {self.diagnosis}>"
